import { IStorageItem } from "./types";

const storage = window.localStorage;

function isBrokenItem(item: IStorageItem): boolean {
  return (
    typeof item.name !== "string" ||
    typeof item.url !== "string" ||
    typeof item.content !== "string"
  );
}

export function getItem(key: string): IStorageItem | null {
  let parsed: IStorageItem | null = null;
  try {
    const text = storage.getItem(key);
    if (text) {
      parsed = JSON.parse(text);
      if (parsed && isBrokenItem(parsed)) {
        parsed = null;
      }
    }
  } catch (err) {
    // ignore error
  }
  return parsed;
}

export function setItem(key: string, item: IStorageItem) {
  try {
    storage.setItem(key, JSON.stringify(item));
  } catch (err) {
    // ignore error
  }
}

export function removeItem(key: string) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    // ignore error
  }
}
