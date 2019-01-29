import * as dateMock from "jest-date-mock";
import path from "path";
import url from "url";
import xhrMock from "xhr-mock";

import {
  LoadScriptEl,
  LoadScriptFallback,
  LoadScriptFromStorage,
  LoadScriptFromXHR,
  SaveScriptToStorage
} from "../loader";
import { IScriptConfig } from "../types";
declare global {
  // tslint:disable-next-line interface-name
  interface Window {
    a: number;
  }
}

const SCRIPT: IScriptConfig = {
  maxAge: 5,
  name: "a.js",
  url: "/a.js"
};

const SCRIPT_LOCAL: IScriptConfig = {
  maxAge: 5,
  name: "a.js",
  url: url.pathToFileURL(path.join(__dirname, "__scripts__", "a.js")).href
};

const SCRIPT_BAD: IScriptConfig = {
  maxAge: 5,
  name: "a.js",
  url: url.pathToFileURL(path.join(__dirname, "__scripts__", "b.js")).href
};
const PREFIX = "TC:";
const CONTENT = "window.a = 1;";

beforeEach(() => {
  xhrMock.setup();
  localStorage.clear();
  (window as any).eval(`window.a = 0`);
});

afterEach(() => {
  xhrMock.teardown();
  localStorage.clear();
  const el = document.getElementById(SCRIPT.name);
  if (el) {
    el.remove();
  }
});

test("LoadScriptEl() should ok", () => {
  expect(window.a).toBe(0);
  LoadScriptEl(SCRIPT, CONTENT);
  const head = document.getElementsByTagName("head")[0];
  const el = document.getElementById(SCRIPT.name)! as HTMLScriptElement;
  expect(head.children.length).toBe(1);
  expect(el).toBeDefined();
  expect(el.innerHTML).toBe(CONTENT);
  expect(el.defer).toBeTruthy();
  expect(window.a).toBe(1);
});

test("LoadScriptFallback() should ok", done => {
  expect(window.a).toBe(0);
  LoadScriptFallback(SCRIPT_LOCAL, err => {
    expect(err).toBeNull();
    expect(window.a).toBe(1);
    done();
  });
});

test("LoadScriptFallback() should fail", done => {
  expect(window.a).toBe(0);
  LoadScriptFallback(SCRIPT_BAD, err => {
    expect(err).toBeDefined();
    expect(err).toBeInstanceOf(Error);
    done();
  });
});

test("LoadScriptFromXHR() should ok", done => {
  expect(window.a).toBe(0);
  xhrMock.get("/a.js", {
    body: CONTENT,
    status: 200
  });
  LoadScriptFromXHR(SCRIPT, 1000, (err, content) => {
    expect(err).toBeNull();
    expect(content).toBe(CONTENT);
    done();
  });
});

test("LoadScriptFromXHR() should ok when status code is 304", done => {
  expect(window.a).toBe(0);
  xhrMock.get("/a.js", {
    body: CONTENT,
    status: 304
  });
  LoadScriptFromXHR(SCRIPT, 1000, (err, content) => {
    expect(err).toBeNull();
    expect(content).toBe(CONTENT);
    done();
  });
});

test("LoadScriptFromXHR() should fail with bad status code", done => {
  expect(window.a).toBe(0);
  xhrMock.get("/a.js", {
    body: CONTENT,
    status: 404
  });
  LoadScriptFromXHR(SCRIPT, 1000, (err, content) => {
    expect(err).toBeDefined();
    expect(err).toBeInstanceOf(Error);
    done();
  });
});

test("LoadScriptFromXHR() should fail", done => {
  expect(window.a).toBe(0);
  LoadScriptFromXHR(SCRIPT, 1000, (err, content) => {
    expect(err).toBeDefined();
    expect(err).toBeInstanceOf(Error);
    done();
  });
});

test("LoadScriptFromXHR() should fail when timeout", done => {
  expect(window.a).toBe(0);
  // tslint:disable-next-line no-empty
  xhrMock.get("/a.js", () => new Promise(() => {}));
  LoadScriptFromXHR(SCRIPT, 100, (err, content) => {
    expect(err).toBeDefined();
    expect(err).toBeInstanceOf(Error);
    done();
  });
});

test("LoadScriptFromStorage() and SaveScriptToStorage() should ok", async done => {
  SaveScriptToStorage(PREFIX, SCRIPT, CONTENT);
  LoadScriptFromStorage(PREFIX, SCRIPT, (err, content) => {
    expect(err).toBeNull();
    expect(content).toBe(CONTENT);
    done();
  });
});

test("LoadScriptFromStorage() should fail when not found", done => {
  LoadScriptFromStorage(PREFIX, SCRIPT, err => {
    expect(err).toBeDefined();
    expect(err).toBeInstanceOf(Error);
    done();
  });
});

test("LoadScriptFromStorage() should fail when stale", done => {
  SaveScriptToStorage(PREFIX, SCRIPT, CONTENT);
  dateMock.advanceBy(SCRIPT.maxAge * 1000 + 100);
  LoadScriptFromStorage(PREFIX, SCRIPT, err => {
    dateMock.clear();
    expect(err).toBeDefined();
    expect(err).toBeInstanceOf(Error);
    done();
  });
});

test("LoadScriptFromStorage() should fail when url changes", async done => {
  SaveScriptToStorage(PREFIX, SCRIPT, CONTENT);
  LoadScriptFromStorage(PREFIX, SCRIPT_LOCAL, err => {
    expect(SCRIPT.name).toBe(SCRIPT_LOCAL.name);
    expect(SCRIPT.url).not.toBe(SCRIPT_LOCAL.url);
    expect(err).toBeDefined();
    expect(err).toBeInstanceOf(Error);
    done();
  });
});
