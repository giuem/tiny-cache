import { getItem, removeItem, setItem } from "../storage";
import { IStorageItem } from "../types";

const ITEM: IStorageItem = {
  content: "console.log(1)",
  expire: new Date().getTime(),
  name: "test",
  url: "http://localhost"
};
const KEY = "TC:test";
const VALUE = JSON.stringify(ITEM);

beforeEach(() => {
  localStorage.clear();
});

afterAll(() => {
  localStorage.clear();
});

describe("getItem()", () => {
  it("should return null when item not found", () => {
    const item = getItem(KEY);
    expect(item).toBeNull();
  });

  it("should return null when parsed error", () => {
    localStorage.setItem(KEY, "bad text");
    expect(localStorage.getItem(KEY)).toBe("bad text");
    const item = getItem(KEY);
    expect(item).toBeNull();
  });

  it("should return null when item is broken", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        content: 11,
        url: "a"
      })
    );
    const item = getItem(KEY);
    expect(item).toBeNull();
  });
});

test("setItem() should work and getItem() should return item", () => {
  setItem(KEY, ITEM);
  expect(localStorage.getItem(KEY)).toBe(VALUE);
  const item = getItem(KEY);
  expect(item).toEqual(ITEM);
});

test("removeItem()", () => {
  setItem(KEY, ITEM);
  expect(localStorage.length).toBe(1);
  removeItem(KEY);
  expect(localStorage.length).toBe(0);
});
