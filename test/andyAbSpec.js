var jsdom = require('jsdom');

var chai = require("chai");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

var AndyAB = require("../lib/andy-ab.js");
var Observer = require("../lib/observer.js");

describe("AndyAB", function() {
  var ab;

  beforeEach(function() {
    ab = new AndyAB("AndyAB");
  });

  afterEach(function() {
    // delete the cohort cookie
    document.cookie = ab.cookiePrefix + ab.name + '=' + "" + ';expires=' + new Date();
  });

  describe("sampleCohort", function() {
    it("should raise an error when the cohorts aren't set", function() {
      expect(ab.sampleCohort).to.throw();
    });

    it("should select a cohort", function() {
      ab.withCohorts(["treatment", "control"]);
      enrolledCohort = ab.sampleCohort();
      expect(enrolledCohort).to.not.be.undefined;
      expect(ab.cohorts).to.contain(enrolledCohort);
    });
  });

  describe("enrol", function() {

    beforeEach(function() {
      ab.withCohorts(["treatment", "control"]);
    });

    describe("when already enrolled", function() {

      beforeEach(function() {
        ab.enrol();
      });

      it("should not reset the cookie", function() {
        var setCookie = sinon.spy(ab, "setCookie")
        ab.enrol();
        expect(setCookie).not.to.have.been.called;
      });

      it("should not execute the enrol callback", function() {
        var callback = sinon.spy();
        ab.enrol(callback);
        expect(callback).not.to.have.been.called;
      });
    });

    describe("when not already enrolled ", function(){
      it("should enrol the user into a cohort", function() {
        expect(ab.getCohort()).to.be.empty;
        ab.enrol();
        expect(ab.getCohort()).to.be.ok;
      });

      it("should execute the enrol callback", function() {
        var callback = sinon.spy();
        ab.enrol(callback);
        expect(callback).to.have.been.called;
      });
    });
  });

  describe("getCohort", function() {

  });

  describe("cookieName", function() {
    describe("when the cookie prefix is set", function() {
      it("should include the prefix", function() {
        ab.cookiePrefix = "prefix";
        expect(ab.cookieName()).to.equal(ab.cookiePrefix + ab.name);
      });
    });

    describe("when the cookie prefix is not set", function() {
      it("should not include a prefix", function() {
        ab.cookiePrefix = "";
        expect(ab.cookieName()).to.equal(ab.name);
      });
    });
  });

  describe("addObserver", function() {
    beforeEach(function() {
        ab.withCohorts(["treatment", "control"]).enrol();
    });

    describe("when the cohort matches the enrolled cohort", function() {
      it("should add the observer to the observers array", function() {
        var notifyAllObservers = sinon.spy(ab, "notifyAllObservers");
        ab.addObserver(ab.getCohort(), "#cake", function() {});
        expect(notifyAllObservers).to.have.been.called;
        expect(ab.observers.length).to.equal(1);
      });
    });

    describe("when the cohort doesn't match the enrolled cohort", function() {
      it("should not add an observer to the observers array", function() {
        ab.enrol();
        var cohort = ab.getCohort();
        var otherCohort = ab.cohorts.filter(function(el) {
          return el !== cohort;
        })[0];
        var notifyAllObservers = sinon.spy(ab, "notifyAllObservers");
        ab.addObserver(otherCohort, "#cake", function() {});
        expect(notifyAllObservers).not.to.have.been.called;
        expect(ab.observers.length).to.equal(0);
      });
    });
  });

  describe("notifyAllObservers", function() {
    it("should notify each observer", function() {
      var observers = [
        new Observer("#cake", function() {})
      ];
      ab.observers = observers;
      var notify = sinon.spy(observers[0], "notify");
      ab.notifyAllObservers();
      expect(notify).to.have.been.called;
    });
  });

});
