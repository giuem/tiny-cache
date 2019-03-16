import { injectElement, injectInlineElement } from "./inject";
import { getItem, removeItem, setItem } from "./storage";
import {
  ICallback,
  IResourceConfig,
  IStorageItem,
  ITinyCacheConfig,
  ResourceType
} from "./types";
import { asyncFn, merge } from "./util";
import { get } from "./xhr";

const config: ITinyCacheConfig = {
  prefix: "TC:",
  timeout: 6000
};

function configure(c: ITinyCacheConfig) {
  merge(config, c);
}

function load(resources: IResourceConfig[]): Promise<void>;
function load(resources: IResourceConfig[], callback: ICallback<void[]>): void;
function load(resources: IResourceConfig[], callback?: ICallback<void[]>) {
  if (!callback) {
    return Promise
      ? new Promise<void>((resolve, reject) => {
          load(resources, err => {
            err ? reject(err) : resolve();
          });
        })
      : void 0;
  }

  asyncFn<void>(
    resources.map(resource => (cb: ICallback<void>) => {
      loadResource(resource, cb);
    }),
    callback
  );
}

function remove(resource: IResourceConfig) {
  removeItem(`${config.prefix}${resource.name}`);
}

function loadResource(resource: IResourceConfig, callback: ICallback<void>) {
  const key = `${config.prefix}${resource.name}`;
  const type = resource.type || (resource.url.split(".").pop() as ResourceType);
  if (type !== "css" && type !== "js") {
    return callback(new Error(`Unknown resource type: ${type}`));
  }

  if (resource.noCache) {
    return injectElement(key, resource.url, type, callback);
  }

  const cached = getItem(key);
  // cached, no update, no expired
  if (
    cached &&
    cached.url === resource.url &&
    (!cached.expire || cached.expire > new Date().getTime())
  ) {
    injectInlineElement(key, cached.content, type);
    callback(null);
  } else {
    get(resource.url, config.timeout!, (err, content) => {
      if (!err && content) {
        const item: IStorageItem = {
          content,
          expire: resource.maxAge
            ? new Date().getTime() + resource.maxAge * 1000
            : null,
          name: resource.name,
          type,
          url: resource.url
        };
        injectInlineElement(key, content, type);
        setItem(key, item);
        callback(null);
      } else {
        injectElement(key, resource.url, type, callback);
      }
    });
  }
}

export { configure, load, remove };
