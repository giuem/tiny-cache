import nock from "nock";
import { injectElement, injectInlineElement } from "../inject";

describe("inject", () => {
  beforeEach(() => {
    // reset document
    document.head.innerHTML = document.body.innerHTML = "";
  });

  describe("injectElement", () => {
    it("should ok", done => {
      nock("http://localhost")
        .get("/a.js")
        .reply(200, "window.a = 1");

      injectElement("id", "http://localhost/a.js", err => {
        expect(err).toBeNull();
        expect((window as any).a).toBe(1);
        done();
      });
    });

    it("should fail", done => {
      injectElement("id", "http://localhost/a.js", err => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe("Failed to load: http://localhost/a.js");
        done();
      });
    });
  });

  describe("injectInlineElement", () => {
    it("should ok", () => {
      injectInlineElement("id", "window.a = 2;");
      expect((window as any).a).toBe(2);
    });
  });
});
