beforeEach(function () {
  window.a = window.b = 0;
  localStorage.clear();
});

afterEach(function () {
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
          { name: "a-js", url: "/scripts/a.js" },
          { name: "b-js", url: "/scripts/b.js" }
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
        { name: "a-js", url: "/scripts/a.js" },
        { name: "b-js", url: "/scripts/b.js" }
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
      tc.load([{ name: "a-js", url: "/scripts/a.js" }], function(err) {
        chai.expect(err).to.be.null;
        chai.expect(localStorage.length).to.equal(1);
        chai.expect(window.a).to.equal(1);
        chai.expect(window.b).to.equal(0);
        tc.load([{ name: "b-js", url: "/scripts/b.js" }], function(err) {
          chai.expect(err).to.be.null;
          chai.expect(localStorage.length).to.equal(2);
          chai.expect(window.b).to.equal(1);
          done();
        });
      });
    });

    it("should cache", function(done) {
      tc.load([{ name: "a-js", url: "/scripts/a.js", maxAge: 1000 }], function(
        err
      ) {
        chai.expect(err).to.be.null;
        chai.expect(localStorage.length).to.equal(1);
        chai.expect(window.a).to.equal(1);
        var oldItem = localStorage.getItem("TC:a-js");
        tc.load([{ name: "a-js", url: "/scripts/a.js" }], function(err) {
          var newItem = localStorage.getItem("TC:a-js");
          chai.expect(err).to.be.null;
          chai.expect(window.a).to.equal(2);
          chai.expect(oldItem).to.equal(newItem);
          done();
        });
      });
    });

    it("should overwrite when url changed", function(done) {
      tc.load(
        [
          { name: "a-js", url: "/scripts/a.js" },
          { name: "b-js", url: "/scripts/b.js" }
        ],
        function(err) {
          chai.expect(err).to.be.null;
          chai.expect(localStorage.length).to.equal(2);
          chai.expect(window.a).to.equal(1);
          chai.expect(window.b).to.equal(1);
          tc.load([{ name: "a-js", url: "/scripts/a2.js" }], function(err) {
            chai.expect(err).to.be.null;
            chai.expect(window.a).to.equal(0);
            done();
          });
        }
      );
    });

    it("should update when expired", function(done) {
      this.timeout(3000);
      var resources = [
        { name: "a-js", url: "/scripts/a.js", maxAge: 1 },
        { name: "b-js", url: "/scripts/b.js", maxAge: 10 }
      ];
      tc.load(resources, function(err) {
        chai.expect(err).to.be.null;
        chai.expect(window.a).to.equal(1);
        var oldExpireA = JSON.parse(localStorage.getItem("TC:a-js")).expire;
        var oldExpireB = JSON.parse(localStorage.getItem("TC:b-js")).expire;
        setTimeout(function() {
          tc.load(resources, function(err) {
            var newExpireA = JSON.parse(localStorage.getItem("TC:a-js")).expire;
            var newExpireB = JSON.parse(localStorage.getItem("TC:b-js")).expire;
            chai.expect(err).to.be.null;
            chai.expect(oldExpireA).to.below(newExpireA);
            chai.expect(oldExpireB).to.equal(newExpireB);
            done();
          });
        }, 1100);
      });
    });

    it("should support cors", function(done) {
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
            url: origin + "/scripts/a.js"
          }
        ],
        function(err) {
          chai.expect(err).to.be.null;
          chai.expect(localStorage.getItem("TC:a-js")).to.not.exist;
          chai.expect(window.a).to.equal(1);
          done();
        }
      );
    });

    it("should fallback in order with no-cors resource", function(done) {
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
            url: origin + "/scripts/a.js"
          }
        ],
        function(err) {
          chai.expect(err).to.be.null;
          chai.expect(localStorage.getItem("TC:a-js")).to.not.exist;
          chai.expect(window.a).to.equal(1);
          chai.expect(window.b).to.equal(0);
          tc.load(
            [
              {
                name: "b-js",
                url: origin + "/scripts/b.js"
              }
            ],
            function(err) {
              chai.expect(localStorage.getItem("TC:b-js")).to.not.exist;
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
          { name: "b-js", url: "/scripts/b2.js" },
          { name: "a-js", url: "/scripts/a.js" },
          { name: "b-js", url: "/scripts/b2.js" }
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
      tc.load([{ name: "a-js", url: "/scripts/a.js" }], function(err) {
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
      tc.load([{ name: "a-js", url: "/scripts/a.js" }], function(err) {
        chai.expect(err).to.be.null;
        chai.expect(localStorage.length).to.equal(1);
        chai.expect(window.a).to.equal(1);
        tc.remove({ name: "a-js", url: "/scripts/a.js" });
        chai.expect(localStorage.length).to.equal(0);
        chai.expect(window.a).to.equal(1);
        done();
      });
    });
  });
});
