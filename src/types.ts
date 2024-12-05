import {CreateCollectionOptions, CreateIndexesOptions, Db, Document, MongoClient} from "mongodb";
import {Identifiable, MongoRepository} from "./repo/mongo-repository";

export type Entity = Identifiable


export type PartialEntity<E extends Entity> = {
    [K in keyof E]?: K extends 'id' ? never : E[K]
}

type IndexType = 1 | -1 | 'text' | '2d'


export type UnnamedCollectionOption<E extends Entity> = {
    objectIdKeys?: StringKeys<Omit<E, 'id'>>[],
    createOption?: CreateCollectionOptions,
    documentToEntityMapper?: (document: Document) => E,
    indexes?: { key: keyof E, type: IndexType, option?: CreateIndexesOptions }[]
}
export type CollectionOption<E extends Entity> = UnnamedCollectionOption<E> & {
    name: string,
}


type StringKeys<T> = {
    [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];


type inferEntityFromMongoRepoOptions<O> = O extends UnnamedCollectionOption<infer E> ? E : never

type Base = {
    db: Db,
    client: MongoClient,
    init: () => Promise<void>
}

export type MongoDatabase<Collections extends { [K in string]: UnnamedCollectionOption<any> }> = Base & {
    [K in keyof Collections]: MongoRepository<inferEntityFromMongoRepoOptions<Collections[K]>>
}

