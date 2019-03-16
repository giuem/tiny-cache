import nock from "nock";
import { injectElement, injectInlineElement } from "../inject";

describe("inject", () => {
  beforeEach(() => {
    // reset document
    document.head.innerHTML = document.body.innerHTML = "";
  });

  describe("injectElement", () => {
    it("js should ok", done => {
      nock("http://localhost")
        .get("/a.js")
        .reply(200, "window.a = 1");

      injectElement("id", "http://localhost/a.js", "js", err => {
        expect(err).toBeNull();
        expect((window as any).a).toBe(1);
        done();
      });
    });

    it("css should ok", done => {
      nock("http://localhost")
        .get("/a.css")
        .reply(200, "body {height: 100px}");

      injectElement("id", "http://localhost/a.css", "css", err => {
        expect(err).toBeNull();
        const link = document.getElementById("id") as HTMLLinkElement;
        expect(link).toBeDefined();
        expect(link.tagName.toLowerCase()).toBe("link");
        expect(link.rel).toBe("stylesheet");
        expect(link.href).toBe("http://localhost/a.css");
        done();
      });
    });

    it("should fail", done => {
      injectElement("id", "http://localhost/a.js", "js", err => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe("Failed to load: http://localhost/a.js");
        done();
      });
    });
  });

  describe("injectInlineElement", () => {
    it("js should ok", () => {
      injectInlineElement("id", "window.a = 2;", "js");
      expect((window as any).a).toBe(2);
    });

    it("css should ok", () => {
      injectInlineElement("id", "body {height: 100px}", "css");
      const link = document.getElementById("id") as HTMLStyleElement;
      expect(link).toBeDefined();
      expect(link.tagName.toLowerCase()).toBe("style");
      expect(link.textContent).toBe("body {height: 100px}");
    });
  });
});
