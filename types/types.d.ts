export interface ITinyCacheConfig {
    prefix?: string;
    timeout?: number;
}
export interface IScriptConfig {
    readonly name: string;
    readonly url: string;
    readonly maxAge?: number;
}
export interface IStorageItem {
    readonly name: string;
    url: string;
    expire: number | null;
    content: string;
}
export declare type ICallback<T> = (err: Error | null, res?: T) => void;
