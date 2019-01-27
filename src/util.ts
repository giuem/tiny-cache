export function merge(obj1: any, obj2: any) {
  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      obj1[key] = obj2[key];
    }
  }
}

export function asyncFn<T>(
  tasks: Array<(callback: (err: Error | null, result: T) => void) => void>,
  callback: null | ((err: Error | null, results: T[] | null) => void)
) {
  const results: T[] = [];
  let count = tasks.length;
  tasks.forEach((task, index) => {
    task((err, result) => {
      results[index] = result;
      if (err) {
        if (callback) {
          callback(err, null);
          callback = null;
        }
      } else if (--count === 0 && callback) {
        callback(null, results);
      }
    });
  });
}
