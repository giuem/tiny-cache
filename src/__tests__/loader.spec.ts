import * as dateMock from "jest-date-mock";
import nock from "nock";

import {
  LoadScriptEl,
  LoadScriptFallback,
  LoadScriptFromStorage,
  LoadScriptFromXHR,
  SaveScriptToStorage
} from "../loader";
import { getItem } from "../storage";
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

describe("LoadScriptEl()", () => {
  it("should ok", () => {
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
});

describe("LoadScriptFallback()", () => {
  it("should ok", done => {
    expect(window.a).toBe(0);
    const scope = nock("http://localhost")
      .get("/a.js")
      .reply(200, CONTENT);

    LoadScriptFallback(SCRIPT, err => {
      expect(err).toBeNull();
      expect(window.a).toBe(1);
      const body = document.getElementsByTagName("body")[0];
      const el = document.getElementById(SCRIPT.name)! as HTMLScriptElement;
      expect(body.children.length).toBe(1);
      expect(el).toBeDefined();
      done();
    });
  });

  it("should fail", done => {
    expect(window.a).toBe(0);
    const scope = nock("http://localhost")
      .get("/a.js")
      .reply(404);
    LoadScriptFallback(SCRIPT, err => {
      expect(err).toBeDefined();
      expect(err).toBeInstanceOf(Error);
      expect(window.a).toBe(0);
      done();
    });
  });
});

describe("LoadScriptFromXHR()", () => {
  it("should ok", done => {
    const scope = nock("http://localhost")
      .get("/a.js")
      .reply(200, CONTENT);
    LoadScriptFromXHR(SCRIPT, 1000, (err, content) => {
      expect(err).toBeNull();
      expect(content).toBe(CONTENT);
      done();
    });
  });

  it("should error when XMLHttpRequest is undefined", done => {
    const xhr = window.XMLHttpRequest;
    window.XMLHttpRequest = undefined;
    LoadScriptFromXHR(SCRIPT, 1000, (err, content) => {
      window.XMLHttpRequest = xhr;
      expect(err).toBeInstanceOf(Error);
      done();
    });
  });

  it("should ok with 304 status code", done => {
    const scope = nock("http://localhost")
      .get("/a.js")
      .reply(304, CONTENT);
    LoadScriptFromXHR(SCRIPT, 1000, (err, content) => {
      expect(err).toBeNull();
      expect(content).toBe(CONTENT);
      done();
    });
  });

  it("should fail with bad status code", done => {
    const scope = nock("http://localhost")
      .get("/a.js")
      .reply(404);

    LoadScriptFromXHR(SCRIPT, 1000, (err, content) => {
      expect(err).toBeDefined();
      expect(err).toBeInstanceOf(Error);
      done();
    });
  });

  it("should fail when request timeout", done => {
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
});

describe("LoadScriptFromStorage()", () => {
  it("should ok", done => {
    SaveScriptToStorage(PREFIX, SCRIPT, CONTENT);
    LoadScriptFromStorage(PREFIX, SCRIPT, (err, content) => {
      expect(err).toBeNull();
      expect(content).toBe(CONTENT);
      done();
    });
  });

  test("undefined maxAge", done => {
    const s: IScriptConfig = {
      name: "s",
      url: "s"
    };
    SaveScriptToStorage(PREFIX, s, CONTENT);
    LoadScriptFromStorage(PREFIX, s, (err, content) => {
      expect(err).toBeNull();
      expect(content).toBe(CONTENT);
      expect(getItem(PREFIX + s.name).expire).toBeNull();
      done();
    });
  });

  it("should fail when not found", done => {
    LoadScriptFromStorage(PREFIX, SCRIPT, err => {
      expect(err).toBeDefined();
      expect(err).toBeInstanceOf(Error);
      done();
    });
  });

  it("should fail when stale", done => {
    SaveScriptToStorage(PREFIX, SCRIPT, CONTENT);
    dateMock.advanceBy(SCRIPT.maxAge * 1000 + 100);
    LoadScriptFromStorage(PREFIX, SCRIPT, err => {
      dateMock.clear();
      expect(err).toBeDefined();
      expect(err).toBeInstanceOf(Error);
      done();
    });
  });

  it("should fail when url changes", done => {
    SaveScriptToStorage(PREFIX, SCRIPT, CONTENT);
    LoadScriptFromStorage(PREFIX, SCRIPT_NEW, err => {
      expect(SCRIPT.name).toBe(SCRIPT_NEW.name);
      expect(SCRIPT.url).not.toBe(SCRIPT_NEW.url);
      expect(err).toBeDefined();
      expect(err).toBeInstanceOf(Error);
      done();
    });
  });
});
