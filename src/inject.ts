import { ICallback, ResourceType } from "./types";

function append(el: HTMLElement) {
  (document.head || document.getElementsByTagName("head")[0]).appendChild(el);
}

function injectInlineElement(id: string, code: string, type: ResourceType) {
  const el = document.createElement(type === "js" ? "script" : "style");
  el.id = id;
  el.appendChild(document.createTextNode(code));
  append(el);
}

function injectElement(
  id: string,
  src: string,
  type: ResourceType,
  cb: ICallback<void>
) {
  let el: HTMLScriptElement | HTMLLinkElement;
  if (type === "js") {
    el = document.createElement("script");
    el.src = src;
    el.async = true;
  } else {
    el = document.createElement("link");
    el.rel = "stylesheet";
    el.href = src;
  }
  el.id = id;

  el.onload = () => {
    cb(null);
  };
  el.onerror = () => {
    cb(new Error(`Failed to load: ${src}`));
  };

  append(el);
}

export { injectInlineElement, injectElement };
