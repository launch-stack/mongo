import {CollectionOption, Entity, MongoDatabase} from "./types";
import {MongoClient, MongoClientOptions} from "mongodb";
import {mongoRepoImplFn} from "./repo/mongo-repo-impl";

export const collection = <E extends Entity>(option: CollectionOption<E>) => option

export function mongodb<
    Collections extends { [K in string]: CollectionOption<any> }
>(
    options: {
        url: string,
        clientOptions?: MongoClientOptions,
        collections: Collections
    }
): MongoDatabase<Collections> {
    const client = new MongoClient(options.url, options.clientOptions)
    const db = client.db()

    async function init() {
        await client.connect()
        for (let collectionsKey in options.collections) {
            const option = options.collections[collectionsKey]
            const collection = await db.createCollection(option.name, option.createOption)
            await Promise.all((option.indexes ?? []).map(index => collection.createIndex({[index.key]: index.type}, index.option)))
        }
    }


    const repos: any = {
        db,
        init,
    }

    const fn = mongoRepoImplFn(db)

    for (let collectionsKey in options.collections) {
        const option = options.collections[collectionsKey]
        repos[collectionsKey] = fn(option)
    }

    return repos
}