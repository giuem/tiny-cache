import { ICallback } from "./types";

function append(el: HTMLElement) {
  (document.head || document.getElementsByTagName("head")[0]).appendChild(el);
}

function injectInlineElement(id: string, code: string) {
  const el = document.createElement("script");
  el.id = id;
  el.text = code;
  append(el);
}

function injectElement(id: string, src: string, cb: ICallback<void>) {
  const el = document.createElement("script");
  // el.id
  el.src = src;
  el.async = true;

  el.onload = () => {
    cb(null);
  };
  el.onerror = () => {
    cb(new Error(`Failed to load: ${src}`));
  };

  append(el);
}

export { injectInlineElement, injectElement };
