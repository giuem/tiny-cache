import * as dateMock from "jest-date-mock";
import nock from "nock";

import { getItem, setItem } from "../storage";
import { configure, load, remove } from "../tiny-cache";
import { IResourceConfig } from "../types";

declare global {
  // tslint:disable-next-line interface-name
  interface Window {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
  }
}
const SCRIPT_A_OK: IResourceConfig = {
  maxAge: 3600,
  name: "a.js",
  url: "/a.js"
};

const SCRIPT_A_ANOTHER: IResourceConfig = {
  maxAge: 3600,
  name: "a.js",
  url: "/a2.js"
};

const SCRIPT_B_BAD: IResourceConfig = {
  maxAge: 3600,
  name: "b.js",
  url: "/b.js"
};

const SCRIPT_C_STALE: IResourceConfig = {
  maxAge: 10,
  name: "c.js",
  url: "/c.js"
};

const SCRIPT_D_CORS: IResourceConfig = {
  maxAge: 3600,
  name: "d.js",
  url: "http://example.com/d.js"
};

const SCRIPT_E_NO_CORS: IResourceConfig = {
  maxAge: 3600,
  name: "e.js",
  url: "http://example.com/e.js"
};

function mockHTTP() {
  const localhost = nock("http://localhost")
    .persist()
    .get("/a.js")
    .reply(200, "window.a++;")
    .get("/a2.js")
    .reply(200, "window.a = -1;")
    .get("/c.js")
    .reply(200, "window.c++;")
    .get("/b.js")
    .reply(404);

  const anotherHost = nock("http://example.com")
    .persist()
    .get("/d.js")
    .reply(200, "window.d++;", { "Access-Control-Allow-Origin": "*" })
    .get("/e.js")
    .reply(200, "window.e++;");
}

beforeEach(() => {
  localStorage.clear();
  (window as any).eval(
    `window.a = window.b = window.c = window.d = window.e = 0`
  );
});

describe("TinyCache", () => {
  describe(".configure()", () => {
    it("should work", () => {
      configure({});
    });
  });

  describe(".load()", () => {
    beforeEach(() => {
      mockHTTP();
      localStorage.clear();
    });

    afterEach(() => {
      nock.cleanAll();
    });

    test("callback mode", done => {
      expect(window.a).toBe(0);
      expect(window.d).toBe(0);
      load([SCRIPT_A_OK, SCRIPT_D_CORS], err => {
        expect(err).toBeNull();
        expect(window.a).toBe(1);
        expect(window.d).toBe(1);
        expect(localStorage.length).toBe(2);
        done();
      });
    });

    test("promise mode", () => {
      expect(window.a).toBe(0);
      expect(window.d).toBe(0);
      return load([SCRIPT_A_OK, SCRIPT_D_CORS]).then(() => {
        expect(window.a).toBe(1);
        expect(window.d).toBe(1);
        expect(localStorage.length).toBe(2);
      });
    });

    test("load in order", () => {
      expect(window.a).toBe(0);
      expect(window.d).toBe(0);
      return load([SCRIPT_A_OK])
        .then(() => {
          expect(window.a).toBe(1);
          expect(localStorage.length).toBe(1);
          return load([SCRIPT_D_CORS]);
        })
        .then(() => {
          expect(window.d).toBe(1);
          expect(localStorage.length).toBe(2);
        });
    });

    test("load fallback", () => {
      expect(window.e).toBe(0);
      return load([SCRIPT_E_NO_CORS]).then(() => {
        expect(window.e).toBe(1);
        expect(localStorage.length).toBe(0);
      });
    });

    test("load from localStorage", () => {
      expect(window.a).toBe(0);
      return load([SCRIPT_A_OK])
        .then(() => {
          expect(window.a).toBe(1);
          expect(localStorage.length).toBe(1);
          return load([SCRIPT_A_OK]);
        })
        .then(() => {
          expect(window.a).toBe(2);
          expect(localStorage.length).toBe(1);
        });
    });

    test("load noCache", () => {
      return load([Object.assign({ noCache: true }, SCRIPT_A_OK)]).then(() => {
        expect(window.a).toBe(1);
        expect(localStorage.length).toBe(0);
      });
    });

    test("maxAge is null", () => {
      const res = Object.assign({}, SCRIPT_A_OK, { maxAge: undefined });
      return load([res])
        .then(() => {
          expect(window.a).toBe(1);
          expect(localStorage.length).toBe(1);
          return load([res]);
        })
        .then(() => {
          expect(window.a).toBe(2);
          expect(localStorage.length).toBe(1);
        });
    });

    it("should update when url changed", () => {
      expect(window.a).toBe(0);
      return load([SCRIPT_A_OK])
        .then(() => {
          expect(window.a).toBe(1);
          expect(localStorage.length).toBe(1);
          expect(getItem("TC:" + SCRIPT_A_OK.name).url).toBe(SCRIPT_A_OK.url);
          return load([SCRIPT_A_ANOTHER]);
        })
        .then(() => {
          expect(window.a).toBe(-1);
          expect(localStorage.length).toBe(1);
          expect(getItem("TC:" + SCRIPT_A_ANOTHER.name).url).toBe(
            SCRIPT_A_ANOTHER.url
          );
        });
    });

    it("should update when script is stale", () => {
      expect(window.c).toBe(0);
      return load([SCRIPT_C_STALE])
        .then(() => {
          expect(window.c).toBe(1);
          expect(localStorage.length).toBe(1);
          dateMock.advanceBy(SCRIPT_C_STALE.maxAge * 1000 + 1000);
          expect(getItem("TC:" + SCRIPT_C_STALE.name).expire).toBeLessThan(
            new Date().getTime()
          );
          return load([SCRIPT_C_STALE]);
        })
        .then(() => {
          expect(window.c).toBe(2);
          expect(localStorage.length).toBe(1);
          expect(getItem("TC:" + SCRIPT_C_STALE.name).expire).toBeGreaterThan(
            new Date().getTime()
          );
          dateMock.clear();
        });
    });

    it("should ok when some scripts are broken", () => {
      return load([SCRIPT_B_BAD, SCRIPT_E_NO_CORS]).catch(err => {
        expect(err).toBeInstanceOf(Error);
        expect(window.b).toBe(0);
        expect(window.e).toBe(1);
        expect(localStorage.length).toBe(0);
      });
    });

    it("should fallback when localStorage item is broken", () => {
      setItem(`TC:${SCRIPT_A_OK.name}`, "" as any);
      // SaveScriptToStorage("TC:", SCRIPT_A_OK, "");
      expect(window.a).toBe(0);
      expect(localStorage.length).toBe(1);
      return load([SCRIPT_A_OK]).then(() => {
        expect(window.a).toBe(1);
        expect(localStorage.length).toBe(1);
      });
    });

    it("should throw error when suffix is unknown", () => {
      return load([
        {
          name: "a",
          url: "./aa"
        }
      ]).catch(err => {
        expect(err).toBeInstanceOf(Error);
      });
    });
  });

  describe(".remove()", () => {
    beforeEach(() => {
      mockHTTP();
      localStorage.clear();
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it("should ok", () => {
      return load([SCRIPT_A_OK]).then(() => {
        expect(localStorage.length).toBe(1);
        remove(SCRIPT_A_OK);
        expect(localStorage.length).toBe(0);
      });
    });
  });
});
