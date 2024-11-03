type Projection<M> = {
    [K in keyof M]: 1 | 0
}

type inferProjectionModel<P> = P extends Projection<infer M> ? M : never;



type MongoAggregationBuilder<M> = {
    match: (filter: M) => MongoAggregationBuilder<M>
    group: (group: M) => MongoAggregationBuilder<M>
    project: (project: M) => MongoAggregationBuilder<M>
    sort: (sort: M) => MongoAggregationBuilder<M>
    build: () => M
}