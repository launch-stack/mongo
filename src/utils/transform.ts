export interface Transform<I, O> {
    to(input: I): O

    from(from: O): I
}

export namespace Transform {

    type inferInput<T> = T extends Transform<infer F, any> ? F : never;
    type inferOutput<T> = T extends Transform<any, infer T> ? T : never;

    type IsValidSequence<T> =
        T extends [Transform<any, infer B>, Transform<infer C, any>, ...infer Rest]
            ? [B] extends [C]
                ? IsValidSequence<[Transform<C, any>, ...Rest]>
                : false
            : true;

    type First<T extends any[]> = T extends [infer F, ...any[]] ? F : never;
    type Last<T extends any[]> = T extends [...any[], infer L] ? L : never;

    type MergeTransforms<T extends Transform<any, any>[]> =
        IsValidSequence<T> extends true
            ? Transform<
                inferInput<First<T>>,
                inferOutput<Last<T>>
            >
            : never;

    export function of<F, T>(transform: Transform<F, T>): Transform<F, T> {
        return transform;
    }

    export function pipe<T extends Transform<any, any>[]>(
        ...transforms: T & ([IsValidSequence<T>] extends [true] ? unknown : ["Error: Invalid Transform Sequence"])
    ): MergeTransforms<T> {
        return {
            to: (from: inferInput<First<T>>) => {
                return transforms.reduce((result, t) => t.to(result), from as any);
            },
            from: (from: inferOutput<Last<T>>) => {
                return transforms
                    .slice()
                    .reverse()
                    .reduce((result, t) => t.from(result), from as any);
            },
        } as MergeTransforms<T>;
    }
}