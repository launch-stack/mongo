import {WhereOptions} from "./filter";
import {Filter} from "mongodb";
import {ObjectIdUtils} from "../utils/object-id-utils";
import {an} from "vitest/dist/chunks/reporters.anwo7Y6a";

export function mapWhereOptionToMongoFilter(where: WhereOptions<any>, objectIdKeys: string[]): any {
    if ("and" in where) {
        const and = where.and as WhereOptions<any> []
        return {$and: and.map(it => mapWhereOptionToMongoFilter(it, objectIdKeys))}
    } else if ("or" in where) {
        const or = where.or as WhereOptions<any> []
        return {$or: or.map(it => mapWhereOptionToMongoFilter(it, objectIdKeys))}
    } else {
        //if key is id, convert it to _id
        return Object.fromEntries(
            Object.entries(where)
                .map(([key, value]) => {
                    if (key === "id") {
                        return ["_id", mapFilterToMongoFilter(value as Filter<any>, it => ObjectIdUtils.fromStringSafe(it))]
                    }
                    if (objectIdKeys.includes(key)) {
                        return [key, mapFilterToMongoFilter(value as Filter<any>, it => ObjectIdUtils.fromStringSafe(it))]
                    }
                    return [key, mapFilterToMongoFilter(value as Filter<any>)]
                })
        )
    }
}

function mapFilterToMongoFilter(filter: Filter<any>, transform: (v: any) => any = it => it): any {
    if (typeof filter === "object") {
        const mongoFilter: any = {}
        if ("eq" in filter) mongoFilter.$eq = transform(filter.eq)
        if ("ne" in filter) mongoFilter.$ne = transform(filter.ne)
        if ("regex" in filter) mongoFilter.$regex = new RegExp(filter.regex, filter.flags);
        if ("gt" in filter) mongoFilter.$gt = transform(filter.gt);
        if ("gte" in filter) mongoFilter.$gte = transform(filter.gte);
        if ("lt" in filter) mongoFilter.$lt = transform(filter.lt);
        if ("lte" in filter) mongoFilter.$lte = transform(filter.lte);
        if ("in" in filter) mongoFilter.$in = filter.in?.map(transform) ?? [];
        if ("nin" in filter) mongoFilter.$nin = filter.nin?.map(transform) ?? [];

        return mongoFilter
    }
    return transform(filter)
}