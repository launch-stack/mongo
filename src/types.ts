import {CreateCollectionOptions, CreateIndexesOptions, Db, Document} from "mongodb";
import {Identifiable, MongoRepository} from "./repo/mongo-repository";

export type Entity = Identifiable


export type PartialEntity<E extends Entity> = Partial<Omit<E, 'id'>>

type IndexType = 1 | -1 | 'text' | '2d'


export type CollectionOption<E extends Entity> = {
    name: string,
    objectIdKeys?: StringKeys<Omit<E, 'id'>>[],
    createOption?: CreateCollectionOptions,
    documentToEntityMapper?: (document: Document) => E,
    indexes?: { key: keyof E, type: IndexType, option?: CreateIndexesOptions }[]
}


type StringKeys<T> = {
    [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];


type inferEntityFromMongoRepoOptions<O> = O extends CollectionOption<infer E> ? E : never

type Base = {
    db: Db
}

export type MongoDatabase<Collections extends { [K in string]: CollectionOption<any> }> = Base & {
    [K in keyof Collections]: MongoRepository<inferEntityFromMongoRepoOptions<Collections[K]>>
}

