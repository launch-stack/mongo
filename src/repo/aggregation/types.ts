import {WhereOptions} from "../../filters/filter";
import {Entity} from "../../types";

export type AggregationStage<E> =
    | { $match: WhereOptions<E> }
    | { $project: any }
    | { $group: any }
    | { $sort: any }
    | { $limit: number }
    | { $skip: number }
    | { $unwind: string }
    | { $lookup: any }


export type AggregationPipeline<E extends Entity> = AggregationStage<E>[]
export type inferAggregationResult<T> = T extends AggregationStage<infer E>[] ? E : never