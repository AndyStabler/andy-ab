/* jshint -W024 */
/* jshint expr:true */

var jsdom = require('jsdom');

var chai = require("chai");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

var ExperimentCookie = require("../lib/experiment-cookie.js");
var Cookies = require("js-cookie");

describe("ExperimentCookie", function() {
  var cookie;

  beforeEach(function() {
    cookie = new ExperimentCookie("AndyAB");
  });

  afterEach(function() {
    Cookies.remove(cookie.name);
  });

  describe("getCohort", function() {
    it("should return undefined when the cookie does not exist", function() {
      var cohort = cookie.getCohort("test1");
      expect(cohort).to.be.undefined;
    });

    describe("when the cookie exists", function() {
      beforeEach(function() {
        Cookies.set(cookie.name, "{}");
      });

      it("should return undefined when the experiment is not present", function() {
        expect(cookie.getCohort("test1")).to.be.undefined;
      });

      it("should return the cohort", function() {
        cookie.setCohort("test1", "control");
        expect(cookie.getCohort("test1")).to.equal("control");
      });
    });
  });

  describe("setCohort", function() {
    it("should create and set the cookie when it does not exist", function() {
      cookie.setCohort("test1", "control");
      expect(cookie.getCohort("test1")).to.equal("control");
    });

    describe("when the cookie exists", function() {
      beforeEach(function() {
        Cookies.set(cookie.name, "{}");
      });

      it("should overwrite the existing cohort when the experiment is present", function() {
        cookie.setCohort("test1", "control");
        cookie.setCohort("test1", "treatment");
        expect(cookie.getCohort("test1")).to.equal("treatment");
      });

      it("should set the cohort", function() {
        cookie.setCohort("test1", "treatment");
        expect(cookie.getCohort("test1")).to.equal("treatment");
      });

      it("should allow more than one experiment to be stored", function() {
        cookie.setCohort("test1", "control");
        cookie.setCohort("test2", "treatment");
        expect(cookie.getCohort("test1")).to.equal("control");
        expect(cookie.getCohort("test2")).to.equal("treatment");
      });
    });
  });
});
