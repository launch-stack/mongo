import {FindOptions, WhereOptions} from "../filters/filter";
import {Entity, PartialEntity} from "../types";
import {Document} from "mongodb";

export interface Identifiable {
    id: string
}


export interface MongoRepository<E extends Entity> {
    findById(id: string): Promise<E | null>

    insert(entity: E): Promise<void>

    insertMany(entity: E[], options?: { ordered?: boolean }): Promise<void>

    updateById(id: string, update: PartialEntity<E>): Promise<void>

    updateOneBy(where: WhereOptions<E>, update: PartialEntity<E>): Promise<void>

    updateMany(where: WhereOptions<E>, update: PartialEntity<E>): Promise<{ matched: number, modified: number }>

    deleteById(id: string): Promise<boolean>

    find(options: FindOptions<E>): Promise<E[]>

    findOneBy(options: WhereOptions<E>): Promise<E | null>

    count(where: WhereOptions<E>): Promise<number>

    exists(where: WhereOptions<E>): Promise<boolean>

    deleteBy(where: WhereOptions<E>): Promise<number>

    aggregate(stages: Record<string, any>[]): Promise<Document[]>

    watch(options: FindOptions<E>): AsyncIterable<E>
}