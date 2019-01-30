import * as dateMock from "jest-date-mock";
import nock from "nock";

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

const SCRIPT_NEW: IScriptConfig = {
  maxAge: 5,
  name: "a.js",
  url: "/a.js?v=2"
};

const SCRIPT_BAD: IScriptConfig = {
  maxAge: 5,
  name: "a.js",
  url: "/a1.js"
};
const PREFIX = "TC:";
const CONTENT = "window.a = 1;";

beforeEach(() => {
  localStorage.clear();
  (window as any).eval(`window.a = 0`);
});

afterEach(() => {
  nock.cleanAll();
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
  const scope = nock("http://localhost")
    .get("/a.js")
    .reply(200, CONTENT);

  LoadScriptFallback(SCRIPT, err => {
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
  const scope = nock("http://localhost")
    .get("/a.js")
    .reply(200, CONTENT);
  LoadScriptFromXHR(SCRIPT, 1000, (err, content) => {
    expect(err).toBeNull();
    expect(content).toBe(CONTENT);
    done();
  });
});

test("LoadScriptFromXHR() should ok when status code is 304", done => {
  expect(window.a).toBe(0);
  const scope = nock("http://localhost")
    .get("/a.js")
    .reply(304, CONTENT);
  LoadScriptFromXHR(SCRIPT, 1000, (err, content) => {
    expect(err).toBeNull();
    expect(content).toBe(CONTENT);
    done();
  });
});

test("LoadScriptFromXHR() should fail with bad status code", done => {
  expect(window.a).toBe(0);
  const scope = nock("http://localhost")
    .get("/a.js")
    .reply(404);

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
  const scope = nock("http://localhost")
    .get("/a.js")
    .delayConnection(1000)
    .reply(200, CONTENT);

  LoadScriptFromXHR(SCRIPT, 100, (err, content) => {
    expect(err).toBeDefined();
    expect(err).toBeInstanceOf(Error);
    done();
  });
});

test("LoadScriptFromStorage() and SaveScriptToStorage() should ok", done => {
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

test("LoadScriptFromStorage() should fail when url changes", done => {
  SaveScriptToStorage(PREFIX, SCRIPT, CONTENT);
  LoadScriptFromStorage(PREFIX, SCRIPT_NEW, err => {
    expect(SCRIPT.name).toBe(SCRIPT_NEW.name);
    expect(SCRIPT.url).not.toBe(SCRIPT_NEW.url);
    expect(err).toBeDefined();
    expect(err).toBeInstanceOf(Error);
    done();
  });
});
