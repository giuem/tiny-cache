import { getItem, setItem } from "./storage";
import { ICallback, IScriptConfig, IStorageItem } from "./types";

function createLoaderError(script: IScriptConfig): Error {
  return new Error(`Failed to load ${script.name}: ${script.url}`);
}

function createNoStorageItemError(script: IScriptConfig): Error {
  return new Error(`No such item or item is staled: ${script.name}`);
}

export function LoadScriptEl(script: IScriptConfig, content: string) {
  const s = document.createElement("script");
  s.id = script.name;
  s.text = content;
  s.defer = true;
  document.getElementsByTagName("head")[0].appendChild(s);
}

export function LoadScriptFallback(
  script: IScriptConfig,
  callback: ICallback<null>
) {
  const s = document.createElement("script");
  s.id = script.name;
  s.src = script.url;
  // @todo: need more test
  // s.defer = true;
  s.onload = () => {
    callback(null);
  };
  s.onerror = () => {
    callback(createLoaderError(script));
  };
  document.getElementsByTagName("body")[0].appendChild(s);
}

export function LoadScriptFromXHR(
  script: IScriptConfig,
  timeout: number,
  callback: ICallback<string>
) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", script.url, true);
  xhr.timeout = timeout;
  xhr.onload = () => {
    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
      callback(null, xhr.responseText);
    } else {
      callback(new Error(`Failed to load: ${script.url}`));
    }
  };
  xhr.ontimeout = xhr.onerror = () => {
    callback(new Error(`Failed to load: ${script.url}`));
  };
  xhr.send();
}

export function LoadScriptFromStorage(
  prefix: string,
  script: IScriptConfig,
  callback: ICallback<string>
) {
  const key = `${prefix}${script.name}`;
  const item = getItem(key);
  if (!item) {
    callback(createNoStorageItemError(script));
  } else {
    if (item.url !== script.url || item.expire < new Date().getTime()) {
      callback(createNoStorageItemError(script));
    } else {
      callback(null, item.content);
    }
  }
}

export function SaveScriptToStorage(
  prefix: string,
  script: IScriptConfig,
  content: string
) {
  const key = `${prefix}${script.name}`;
  const item: IStorageItem = {
    content,
    expire: new Date().getTime() + script.maxAge * 1000,
    name: script.name,
    url: script.url
  };
  setItem(key, item);
}
