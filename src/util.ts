import { ICallback } from "./types";

export function merge(obj1: any, obj2: any) {
  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      obj1[key] = obj2[key];
    }
  }
}

export function asyncFn<T>(
  tasks: Array<(callback: ICallback<T>) => void>,
  callback: null | (ICallback<Array<T | undefined>>)
) {
  const results: Array<T | undefined> = [];
  let count = tasks.length;
  tasks.forEach((task, index) => {
    task((err, result) => {
      results[index] = result;
      if (err) {
        if (callback) {
          callback(err);
          callback = null;
        }
      }
      if (--count === 0 && callback) {
        callback(null, results);
      }
    });
  });
}
