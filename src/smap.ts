import _ from "lodash";

export type SMap<K> = { [p: string]: K };

export const keys: <T extends string, K>(
    dict: { [p in T]?: K } | undefined,
) => T[] = _.keys as any;

export const values: <T extends string, K>(
    dict: { [p in T]?: K } | undefined,
) => K[] = _.values as any;

export const mapValues: <T extends string, K, N>(
    dict: { [p in T]?: K } | undefined,
    fn: (value: K, key: T) => N,
) => { [p in T]: N } = _.mapValues as any;

export const forEach: <T extends string, K>(
    dict: { [p in T]?: K } | undefined,
    fn: (value: K, key: T) => void,
) => void = _.forEach;

export function mapPairs<T extends string, K, ReturnType>(
    dict: { [p in T]?: K } | undefined,
    fn: (value: K, key: T) => ReturnType,
): ReturnType[] {
    return values(mapValues(dict, fn));
}

export const fromPairs: <T extends string, K>(
    pairs: [T, K][],
) => { [p in T]: K } = _.fromPairs as any;
