import {Entity, MongoDatabase, UnnamedCollectionOption} from "./types";
import {MongoClient, MongoClientOptions} from "mongodb";
import {mongoRepoImplFn} from "./repo/mongo-repo-impl";
import {Identifiable} from "./repo/mongo-repository";

export const collection = <E extends Entity>(option: UnnamedCollectionOption<E> & { name?: string }) => option

export function mongodb<I extends Identifiable>(
    options: {
        url: string,
        clientOptions?: MongoClientOptions,
        collections: { [K in string]: UnnamedCollectionOption<I> & { name?: string } }
    }
): MongoDatabase<typeof options.collections> {
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


    const repos: any = {
        db,
        init,
        client,
    }

    const fn = mongoRepoImplFn(db)

    for (let collectionsKey in options.collections) {
        const option = options.collections[collectionsKey]
        repos[collectionsKey] = fn({
            ...option,
            name: option.name ?? collectionsKey
        })
    }

    return repos
}