
type NumberFilter =
    | number
    | { eq?: number; ne?: number; gt?: number; gte?: number; lt?: number; lte?: number; in?: number[]; nin?: number[] };

type StringFilter =
    | string
    | { eq: string }
    | { regex: string, flags?: string }
    | { ne: string }
    | { gt: string }
    | { gte: string }
    | { lt: string }
    | { lte: string }
    | { in: string[] }
    | { nin: string[] }


type BooleanFilter =
    | boolean
    | { eq?: boolean; ne?: boolean };

type DateFilter =
    | Date
    | { eq?: Date; ne?: Date; gt?: Date; gte?: Date; lt?: Date; lte?: Date; in?: Date[]; nin?: Date[] };

type ArrayFilter<T> =
    | T[]
    | { eq?: T[]; ne?: T[]; in?: T[]; nin?: T[] };


export type Filter<T> =
    T extends number ? NumberFilter :
        T extends string ? StringFilter :
            T extends boolean ? BooleanFilter :
                T extends Date ? DateFilter :
                    T extends Array<infer U> ? ArrayFilter<U> :
                        never


export type WhereOptions<E> =
    | { [K in keyof E]?: Filter<E[K]> }
    | { and: WhereOptions<E>[] }
    | { or: WhereOptions<E>[] }

export type SortDirection = 'asc' | 'desc'

export type SortOptions<E> = { [K in keyof E]?: SortDirection }

type ProjectionOptions1<E> = { [K in keyof E]?: 1 }
type ProjectionOptions0<E> = { [K in keyof E]?: 0 }

export type ProjectionOptions<E extends Record<string, any>> = ProjectionOptions1<E> | ProjectionOptions0<E>


export type FindOptions<E extends Record<string, any>> = {
    where?: WhereOptions<E>,
    limit?: number,
    skip?: number,
    sort?: SortOptions<E>,
}

