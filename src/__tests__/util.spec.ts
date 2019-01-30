import { asyncFn, merge } from "../util";

const asyncAdd = (
  a: number,
  b: number,
  callback: (err: Error | null, data: number) => void
) => {
  setTimeout(() => {
    callback(null, a + b);
  }, 0);
};

test("merge() should work", () => {
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

describe("asyncFn()", () => {
  it("should work when all tasks succeeded", done => {
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

  it("should work when some tasks failed", done => {
    asyncFn<number>(
      [
        cb => {
          asyncAdd(1, 1, cb);
        },
        cb => {
          setTimeout(() => {
            cb(new Error("error"), 0);
          }, 0);
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
        expect(results).toBeUndefined();
        done();
      }
    );
  });
});
