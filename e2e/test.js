var server = null;

function mockServer() {
  if (server) return;

  server = sinon.createFakeServer();
  server.autoRespond = true;

  server.respondWith("/assets/a.js", [
    200,
    { "Content-Type": "text/javascript" },
    "window.a++;"
  ]);
  server.respondWith("/assets/a-2.js", [
    200,
    { "Content-Type": "text/javascript" },
    "window.a=-1;"
  ]);
  server.respondWith("/assets/b.js", [
    200,
    { "Content-Type": "text/javascript" },
    "window.b++;"
  ]);
}

function restoreServer() {
  if (server) {
    server.restore();
    server = null;
  }
}

beforeEach(function() {
  mockServer();

  window.a = window.b = 0;

  localStorage.clear();
});

afterEach(function() {
  restoreServer();

  localStorage.clear();

  document.querySelectorAll("#a-js").forEach(function(s) {
    s.remove();
  });
  document.querySelectorAll("#b-js").forEach(function(s) {
    s.remove();
  });
});

describe("localStorage", function() {
  it("should support", function() {
    chai.expect(localStorage).to.not.be.undefined;

    localStorage.setItem("a", "a");
    chai.expect(localStorage.getItem("a")).to.equal("a");

    localStorage.removeItem("a");
    chai.expect(localStorage.getItem("a")).to.not.exist;
  });
});

describe("TinyCache.load()", function() {
  var tc = new TinyCache();

  describe(".load()", function() {
    it("should work with callback", function(done) {
      tc.load(
        [
          { name: "a-js", url: "/assets/a.js" },
          { name: "b-js", url: "/assets/b.js" }
        ],
        function(err) {
          chai.expect(err).to.be.null;
          chai.expect(localStorage.length).to.equal(2);
          chai.expect(window.a).to.equal(1);
          chai.expect(window.b).to.equal(1);

          done();
        }
      );
    });

    it("should work with Promise", function(done) {
      if (!window.Promise) {
        return this.skip();
      }

      tc.load([
        { name: "a-js", url: "/assets/a.js" },
        { name: "b-js", url: "/assets/b.js" }
      ])
        .then(function() {
          chai.expect(localStorage.length).to.equal(2);
          chai.expect(window.a).to.equal(1);
          chai.expect(window.b).to.equal(1);

          done();
        })
        .catch(function(err) {
          done(err);
        });
    });

    it("should load in order", function(done) {
      tc.load([{ name: "a-js", url: "/assets/a.js" }], function(err) {
        chai.expect(err).to.be.null;
        chai.expect(localStorage.length).to.equal(1);
        chai.expect(window.a).to.equal(1);
        chai.expect(window.b).to.equal(0);

        tc.load([{ name: "b-js", url: "/assets/b.js" }], function(err) {
          chai.expect(err).to.be.null;
          chai.expect(localStorage.length).to.equal(2);
          chai.expect(window.b).to.equal(1);

          done();
        });
      });
    });

    it("should cache", function(done) {
      tc.load([{ name: "a-js", url: "/assets/a.js" }], function(err) {
        chai.expect(err).to.be.null;
        chai.expect(localStorage.length).to.equal(1);
        chai.expect(window.a).to.equal(1);

        tc.load([{ name: "a-js", url: "/assets/a.js" }], function(err) {
          chai.expect(err).to.be.null;
          chai.expect(window.a).to.equal(2);
          chai.expect(server.requests.length).to.equal(1);

          done();
        });
      });
    });

    it("should overwrite when url changed", function(done) {
      tc.load(
        [
          { name: "a-js", url: "/assets/a.js" },
          { name: "b-js", url: "/assets/b.js" }
        ],
        function(err) {
          chai.expect(err).to.be.null;
          chai.expect(localStorage.length).to.equal(2);
          chai.expect(window.a).to.equal(1);
          chai.expect(window.b).to.equal(1);
          chai.expect(server.requests.length).to.equal(2);

          tc.load([{ name: "a-js", url: "/assets/a-2.js" }], function(err) {
            chai.expect(err).to.be.null;
            chai.expect(window.a).to.equal(-1);
            chai.expect(server.requests.length).to.equal(3);

            done();
          });
        }
      );
    });

    it("should update when expired", function(done) {
      var clock = sinon.useFakeTimers({ toFake: ["Date"] });
      var resources = [
        { name: "a-js", url: "/assets/a.js", maxAge: 1 },
        { name: "b-js", url: "/assets/b.js", maxAge: 10 }
      ];
      tc.load(resources, function(err) {
        chai.expect(err).to.be.null;
        chai.expect(server.requests.length).to.equal(2);

        clock.tick(2000); // 2 seconds

        tc.load(resources, function(err) {
          chai.expect(err).to.be.null;
          chai.expect(server.requests.length).to.equal(3);

          clock.restore();
          clock = null;

          done();
        });
      });
    });

    it("should support cors", function(done) {
      restoreServer();

      window.Cookies = undefined;

      chai.expect(localStorage.getItem("TC:a-js")).to.not.exist;
      chai.expect(window.Cookies).to.not.exist;

      tc.load(
        [
          {
            name: "a-js",
            url:
              "https://cdn.jsdelivr.net/npm/js-cookie@2.2.0/src/js.cookie.min.js"
          }
        ],
        function(err) {
          chai.expect(err).to.be.null;
          chai.expect(localStorage.getItem("TC:a-js")).to.exist;
          chai.expect(window.Cookies).to.exist;

          done();
        }
      );
    });

    it("should fallback with no-cors resource", function(done) {
      restoreServer();

      var hostname = document.location.hostname;
      var origin = document.location.origin;
      if (hostname === "localhost") {
        origin = origin.replace("localhost", "127.0.0.1");
      } else if (hostname === "127.0.0.1") {
        origin = origin.replace("127.0.0.1", "localhost");
      } else {
        return this.skip();
      }

      tc.load(
        [
          {
            name: "a-js",
            url: origin + "/assets/a.js"
          }
        ],
        function(err) {
          chai.expect(err).to.be.null;
          chai.expect(localStorage.length).to.equal(0);
          chai.expect(window.a).to.equal(1);

          done();
        }
      );
    });

    it("should fallback in order with no-cors resource", function(done) {
      restoreServer();

      var hostname = document.location.hostname;
      var origin = document.location.origin;
      if (hostname === "localhost") {
        origin = origin.replace("localhost", "127.0.0.1");
      } else if (hostname === "127.0.0.1") {
        origin = origin.replace("127.0.0.1", "localhost");
      } else {
        return this.skip();
      }

      tc.load(
        [
          {
            name: "a-js",
            url: origin + "/assets/a.js"
          }
        ],
        function(err) {
          chai.expect(err).to.be.null;
          chai.expect(localStorage.length).to.equal(0);
          chai.expect(window.a).to.equal(1);
          chai.expect(window.b).to.equal(0);

          tc.load(
            [
              {
                name: "b-js",
                url: origin + "/assets/b.js"
              }
            ],
            function(err) {
              chai.expect(localStorage.length).to.equal(0);
              chai.expect(window.b).to.equal(1);

              done();
            }
          );
        }
      );
    });

    it("should work when some resources are broken", function(done) {
      tc.load(
        [
          { name: "b-js", url: "/assets/b2.js" },
          { name: "a-js", url: "/assets/a.js" },
          { name: "b-js", url: "/assets/b2.js" }
        ],
        function(err) {
          chai.expect(err).to.instanceOf(Error);
          chai.expect(localStorage.length).to.equal(1);
          chai.expect(window.a).to.equal(1);
          chai.expect(window.b).to.equal(0);

          done();
        }
      );
    });

    it("should fallback when localStorage item is broken", function(done) {
      var bad_text = "balabala";

      localStorage.setItem("TC:a-js", bad_text);

      tc.load([{ name: "a-js", url: "/assets/a.js" }], function(err) {
        chai.expect(err).to.be.null;
        chai.expect(localStorage.length).to.equal(1);
        chai.expect(localStorage.getItem("TC:a-js")).to.not.equal(bad_text);
        chai.expect(window.a).to.equal(1);

        done();
      });
    });
  });

  describe(".remove()", function() {
    it("should remove", function(done) {
      tc.load([{ name: "a-js", url: "/assets/a.js" }], function(err) {
        chai.expect(err).to.be.null;
        chai.expect(localStorage.length).to.equal(1);
        chai.expect(window.a).to.equal(1);

        tc.remove({ name: "a-js", url: "/assets/a.js" });

        chai.expect(localStorage.length).to.equal(0);
        chai.expect(window.a).to.equal(1);

        done();
      });
    });
  });
});
