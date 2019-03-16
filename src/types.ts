export interface ITinyCacheConfig {
  prefix?: string;
  timeout?: number;
}

export type ResourceType = "js" | "css";

export interface IResourceConfig {
  readonly name: string;
  readonly url: string;
  readonly maxAge?: number;
  readonly noCache?: boolean;
  readonly type?: ResourceType;
}

export interface IStorageItem {
  readonly name: string;
  url: string;
  expire: number | null;
  content: string;
  type: ResourceType;
}

export type ICallback<T> = (err: Error | null, res?: T) => void;
