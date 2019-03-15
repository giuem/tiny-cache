import { injectElement, injectInlineElement } from "./inject";
import { getItem, removeItem, setItem } from "./storage";
import {
  ICallback,
  IResourceConfig,
  IStorageItem,
  ITinyCacheConfig
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
      loadJS(resource, cb);
    }),
    callback
  );
}

function remove(resource: IResourceConfig) {
  removeItem(`${config.prefix}${resource.name}`);
}

function loadJS(js: IResourceConfig, callback: ICallback<void>) {
  const key = `${config.prefix}${js.name}`;

  if (js.noCache) {
    return injectElement(key, js.url, callback);
  }

  const cached = getItem(key);
  // cached, no update, no expired
  if (
    cached &&
    cached.url === js.url &&
    (!cached.expire || cached.expire > new Date().getTime())
  ) {
    injectInlineElement(key, cached.content);
    callback(null);
  } else {
    get(js.url, config.timeout!, (err, content) => {
      if (!err && content) {
        const item: IStorageItem = {
          content,
          expire: js.maxAge ? new Date().getTime() + js.maxAge * 1000 : null,
          name: js.name,
          url: js.url
        };
        injectInlineElement(key, content);
        setItem(key, item);
        callback(null);
      } else {
        injectElement(key, js.url, callback);
      }
    });
  }
}

export { configure, load, remove };
