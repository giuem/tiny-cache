import {
  LoadScriptEl,
  LoadScriptFallback,
  LoadScriptFromStorage,
  LoadScriptFromXHR,
  SaveScriptToStorage
} from "./loader";
import { removeItem } from "./storage";
import { ICallback, IScriptConfig, ITinyCacheConfig } from "./types";
import { asyncFn, merge } from "./util";

export class TinyCache {
  private config: ITinyCacheConfig = {
    prefix: "TC:",
    timeout: 6000
  };

  constructor(config?: ITinyCacheConfig) {
    merge(this.config, config);
  }

  public load(scripts: IScriptConfig[]): Promise<void>;
  public load(
    scripts: IScriptConfig[],
    callback: ICallback<Array<null | undefined>>
  ): void;
  public load(
    scripts: IScriptConfig[],
    callback?: ICallback<Array<null | undefined>>
  ) {
    if (!callback) {
      return new Promise<void>((resolve, reject) => {
        this.load(scripts, err => {
          err ? reject(err) : resolve();
        });
      });
    }
    asyncFn<null>(
      scripts.map(script => (cb: ICallback<null>) => {
        this.loadScript(script, cb);
      }),
      callback
    );
  }

  public remove(script: IScriptConfig) {
    removeItem(`${this.config.prefix}${script.name}`);
  }

  private loadScript(script: IScriptConfig, callback: ICallback<null>) {
    LoadScriptFromStorage(this.config.prefix!, script, (err, content) => {
      if (err) {
        LoadScriptFromXHR(script, this.config.timeout!, (err2, content2) => {
          if (content2 && !err2) {
            LoadScriptEl(script, content2);
            SaveScriptToStorage(this.config.prefix!, script, content2);
            callback(null);
          } else {
            LoadScriptFallback(script, callback);
          }
        });
      } else {
        if (content) {
          LoadScriptEl(script, content);
          callback(null);
        } else {
          LoadScriptFallback(script, callback);
        }
      }
    });
  }
}
