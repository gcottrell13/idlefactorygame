import _ from "lodash";

export type SMap<K> = {[p: string]: K};

export function keys<T extends string, K>(dict: {[p in T]?: K} | undefined): T[] {
    return _.keys(dict) as T[];
}
export function values<T extends string, K>(dict: {[p in T]?: K} | undefined): K[] {
    return _.values(dict) as K[];
}

export function mapValues<T extends string, K, N>(dict: {[p in T]?: K} | undefined, fn: (value: K, key: T) => N): {[p in T]: N} {
    return _.mapValues(dict, fn) as any;
}

export function forEach<T extends string, K>(dict: {[p in T]?: K} | undefined, fn: (value: K, key: T) => void): void {
    _.forEach(dict, fn as any);
}