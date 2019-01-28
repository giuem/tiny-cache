import { merge } from "./util";

interface IScript {
  name: string;
  url: string;
  maxAge: number;
}

interface IConfig {
  sources: IScript[];
  timeout: number;
}

interface IConfigPublic {
  sources: IScript[];
  timeout?: number;
}

interface IStorageItem {
  name: string;
  url: string;
  expire: number;
  content: string;
}
const storage = window.localStorage;

const PREFIX = "TC_";

export class TinyCache {
  private config: IConfig = {
    sources: [],
    timeout: 6000
  };
  constructor(config: IConfigPublic) {
    merge(this.config, config);
  }

  public load(callback?: (error: Error) => void): Promise<void> | void {
    if (!callback) {
      return new Promise((resolve, reject) => {
        this.load(err => {
          err ? reject(err) : resolve();
        });
      });
    }
    // @todo
  }

  private loadScript(script: IScript, callback: (error: Error) => void) {
    this.loadFromCache(script, (err, content, stale) => {
      if (err || stale || !content) {
        this.loadFromRemote(script, (err2, text) => {
          if (err2) {
            callback(err2);
          } else if (text) {
            this.loadScriptEl(script, text);
            this.saveToCache(script, text);
          }
        });
      } else {
        this.loadScriptEl(script, content);
      }
    });
  }

  private loadScriptEl(script: IScript, content: string) {
    const s = document.createElement("script");
    s.id = script.name;
    s.innerText = content;
    s.defer = true;
    document.getElementsByTagName("head")[0].appendChild(s);
  }

  private loadScriptFallback(script: IScript) {
    const s = document.createElement("script");
    s.src = script.url;
    s.defer = true;
    document.getElementsByTagName("body")[0].appendChild(s);
  }

  private loadFromRemote(
    script: IScript,
    callback: (err: Error | null, text?: string) => void
  ) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", script.url, true);
    xhr.timeout = this.config.timeout;
    xhr.onload = () => {
      if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
        callback(null, xhr.responseText);
      }
    };
    xhr.ontimeout = xhr.onerror = () => {
      callback(new Error(`Failed to load: ${script.url}`));
    };
    xhr.send();
  }

  private loadFromCache(
    script: IScript,
    callback: (err: Error | null, text?: string, stale?: boolean) => void
  ) {
    const itemKey = `${PREFIX}${script.name}`;
    const item = storage.getItem(itemKey);
    if (item) {
      const data: IStorageItem = JSON.parse(item);
      if (data.expire < new Date().getTime() || data.url !== script.url) {
        callback(null, data.content, true);
      } else {
        callback(null, data.content, false);
      }
    } else {
      callback(new Error(`${itemKey} is not found`));
    }
  }

  private saveToCache(script: IScript, content: string) {
    const itemKey = `${PREFIX}${script.name}`;
    const data: IStorageItem = {
      content,
      expire: new Date().getTime() + script.maxAge,
      name: script.name,
      url: script.url
    };
  }
}
