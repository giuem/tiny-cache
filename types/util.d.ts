import { ICallback } from "./types";
export declare function merge(obj1: any, obj2: any): void;
export declare function asyncFn<T>(tasks: Array<(callback: ICallback<T>) => void>, callback: null | (ICallback<Array<T | undefined>>)): void;
