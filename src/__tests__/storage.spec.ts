import { getItem, setItem } from "../storage";
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

test("getItem() should return null", () => {
  const item = getItem(KEY);
  expect(item).toBeNull();
});

test("setItem() should work and getItem() should return item", () => {
  setItem(KEY, ITEM);
  expect(localStorage.getItem(KEY)).toBe(VALUE);
  const item = getItem(KEY);
  expect(item).toEqual(ITEM);
});
