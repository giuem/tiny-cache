import { asyncFn, merge } from "./util";

const asyncAdd = (
  a: number,
  b: number,
  callback: (err: Error | null, data: number) => void
) => {
  setTimeout(() => {
    callback(null, a + b);
  }, 0);
};

test("merge()", () => {
  const a = {
    a: "1",
    b: "2",
    c: null,
    d: undefined
  };
  const b = {
    b: "3",
    d: 5,
    e: 6
  };

  merge(a, b);

  expect(a).toMatchObject({
    a: "1",
    b: "3",
    c: null,
    d: 5,
    e: 6
  });
});

test("asyncFn() ok", done => {
  asyncFn<number>(
    [
      cb => {
        asyncAdd(1, 1, cb);
      },
      cb => {
        asyncAdd(1, 2, cb);
      },
      cb => {
        asyncAdd(0, 0, cb);
      }
    ],
    (err, results) => {
      expect(err).toBe(null);
      expect(results).toEqual([2, 3, 0]);
      done();
    }
  );
});

test("asyncFn() error", done => {
  asyncFn<number>(
    [
      cb => {
        asyncAdd(1, 1, cb);
      },
      cb => {
        asyncAdd(1, 2, cb);
      },
      cb => {
        setTimeout(() => {
          cb(new Error("error"), 0);
        }, 0);
      }
    ],
    (err, results) => {
      expect(err).toBeInstanceOf(Error);
      expect(results).toBe(null);
      done();
    }
  );
});
