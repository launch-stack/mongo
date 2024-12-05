import {Entity, MongoDatabase, UnnamedCollectionOption} from "./types";
import {MongoClient, MongoClientOptions} from "mongodb";
import {mongoRepoImplFn} from "./repo/mongo-repo-impl";

export const collection = <E extends Entity>(option: UnnamedCollectionOption<E> & { name?: string } = {}) => option

export function mongodb<C extends { [K in string]: UnnamedCollectionOption<any> & { name?: string } }>(
    options: {
        url: string,
        clientOptions?: MongoClientOptions,
        collections: C
    }
): MongoDatabase<C> {
    const client = new MongoClient(options.url, options.clientOptions)
    const db = client.db()

    async function init() {
        await client.connect()
        for (let collectionsKey in options.collections) {
            const option = options.collections[collectionsKey]
            const collection = await db.createCollection(option.name ?? collectionsKey, option.createOption)
            await Promise.all((option.indexes ?? []).map(index => collection.createIndex({[index.key]: index.type}, index.option)))
        }
    }


    const cols: any = {}

    const fn = mongoRepoImplFn(db)

    for (let collectionsKey in options.collections) {
        const option = options.collections[collectionsKey]
        cols[collectionsKey] = fn({
            ...option,
            name: option.name ?? collectionsKey
        })
    }

    return {
        db,
        client,
        init,
        ...cols,
    }
}