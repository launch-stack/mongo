import {Db, Document, ObjectId} from "mongodb";
import {ObjectIdUtils} from "../utils/object-id-utils";
import {mapWhereOptionToMongoFilter} from "../filters/filter-helpers";
import {FindOptions, SortDirection, WhereOptions} from "../filters/filter";
import {MongoRepository} from "./mongo-repository";
import {CollectionOption, Entity, PartialEntity} from "../types";

export function mongoRepoImplFn(db: Db) {
    return function <E extends Entity>(options: CollectionOption<E>): MongoRepository<E> {
        const collection = db.collection(options.name)
        const objectIdKeys = (options.objectIdKeys ?? []) as string[]
        const toDocument = (entity: E): Document => {
            const result: Document = {}

            for (let key in entity) {
                if (key == 'id') result['_id'] = ObjectIdUtils.fromStringSafe(entity['id'] as string);
                else if (objectIdKeys.includes(key as any)) result[key] = ObjectIdUtils.fromStringSafe(entity[key] as string);
                else result[key] = entity[key];
            }
            return result
        }
        const toEntity = (document: Document): E => {
            const entity: any = {}
            for (let key in document) {
                if (key == '_id') entity['id'] = ObjectIdUtils.toStringSafe(document['_id'] as ObjectId);
                else if (objectIdKeys.includes(key as any)) entity[key] = ObjectIdUtils.toStringSafe(document[key]);
                else entity[key] = document[key];
            }

            return options.documentToEntityMapper?.(entity) ?? (entity as E)
        }


        const nullableToEntity = (document: Document | null): E | null => {
            return document == null ? null : toEntity(document)
        }

        const mapWhere = (where: any) => mapWhereOptionToMongoFilter(where ?? {}, objectIdKeys)

        return {

            async findById(id: string) {
                return collection
                    .findOne({_id: ObjectIdUtils.fromStringSafe(id) as any})
                    .then(nullableToEntity)
            },
            async findOneBy(where: WhereOptions<E>) {
                return collection
                    .findOne(mapWhere(where))
                    .then(nullableToEntity)
            },
            async find(options: FindOptions<E>) {
                if (options.limit == 0) return []
                let query = collection.find(mapWhere(options.where))
                if (options.sort != null) {
                    const r: [string, SortDirection][] = Object.entries(options.sort).map(([key, value]) => [key as string, value])
                    query = query.sort(r)
                }
                if (options.skip) query = query.skip(options.skip)
                if (options.limit != null) query = query.limit(options.limit)
                return query.toArray().then(it => it.map(toEntity))
            },
            async insert(entity: E) {
                const document = toDocument(entity)
                await collection.insertOne(document)
            },
            async insertMany(entity: E[], options: { ordered: boolean }) {
                const documents = entity.map(toDocument)
                await collection.insertMany(documents, {
                    ordered: options.ordered ?? false
                })
            },
            async updateById(id: string, update: PartialEntity<E>) {
                await collection.updateOne(
                    {_id: ObjectIdUtils.fromStringSafe(id) as any},
                    {$set: update},
                )
            },
            async updateOneBy(where: WhereOptions<E>, update: PartialEntity<E>) {
                await collection.updateOne(
                    mapWhere(where),
                    {$set: update},
                )
            },
            async updateMany(where: WhereOptions<E>, update: PartialEntity<E>) {
                return collection
                    .updateMany(mapWhere(where), {$set: update})
                    .then(it => ({matched: it.matchedCount, modified: it.modifiedCount}))
            },

            async count(where: WhereOptions<E>) {
                return collection.countDocuments(mapWhere(where))
            },
            async exists(where: WhereOptions<E>) {
                return collection.countDocuments(mapWhere(where)).then(it => it > 0)
            },
            async deleteById(id: string) {
                return collection
                    .deleteOne({_id: ObjectIdUtils.fromStringSafe(id) as any})
                    .then(it => it.deletedCount > 0)
            },
            async deleteBy(where: WhereOptions<E>) {
                return collection
                    .deleteMany(mapWhere(where))
                    .then(it => it.deletedCount)
            },
            async aggregate(stages) {
                return collection.aggregate(stages).toArray()
            },
            async* watch(options) {
                throw new Error(`Not implemented ${options}`)
            }
        }
    }
}