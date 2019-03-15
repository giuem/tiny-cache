import nock from "nock";
import { get } from "../xhr";

describe("xhr", () => {
  describe("get", () => {
    const url = "http://localhost";

    afterEach(() => {
      nock.cleanAll();
    });

    it("should ok", done => {
      nock(url)
        .get("/")
        .reply(200, "ok");

      get(url, 1000, (err, resp) => {
        expect(err).toBeNull();
        expect(resp).toBe("ok");
        done();
      });
    });

    it("should fail", done => {
      nock(url)
        .get("/")
        .reply(400);

      get(url, 1000, (err, resp) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe(`Failed to request: ${url}`);
        expect(resp).toBeUndefined();
        done();
      });
    });

    it("should fail when timeout", done => {
      nock(url)
        .get("/")
        .delayConnection(1000)
        .reply(200, "ok");

      get(url, 1000, (err, resp) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe(`Failed to request: ${url}`);
        expect(resp).toBeUndefined();
        done();
      });
    });

    it("should fail when XMLHttpRequest is undefined", done => {
      XMLHttpRequest = undefined;
      get(url, 1000, (err, resp) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe("XMLHttpRequest is undefined");
        expect(resp).toBeUndefined();
        done();
      });
    });
  });
});
