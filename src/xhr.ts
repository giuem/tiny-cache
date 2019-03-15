import { ICallback } from "./types";

function xhrError(url: string) {
  return new Error(`Failed to request: ${url}`);
}

function get(url: string, timeout: number, cb: ICallback<string>) {
  if (!XMLHttpRequest) {
    return cb(new Error("XMLHttpRequest is undefined"));
  }

  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.timeout = timeout;
  xhr.onload = () => {
    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
      cb(null, xhr.responseText);
    } else {
      cb(xhrError(url));
    }
  };
  xhr.ontimeout = xhr.onerror = xhr.onabort = () => {
    cb(xhrError(url));
  };
  xhr.send();
}

export { get };
