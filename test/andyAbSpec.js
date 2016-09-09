var jsdom = require('jsdom');

var chai = require("chai");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

var AndyAB = require("../lib/andy-ab.js");
var Cookies = require("js-cookie");
var Observer = require("../lib/document-observer.js");

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
        var setCookie = sinon.spy(Cookies, "set")
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
      beforeEach(function() {
        Cookies.remove(ab.experimentCookie.name);
      });

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

  describe("whenIn", function() {
    beforeEach(function() {
      ab.withCohorts(["treatment", "control"]).enrol();
    });

    it("should call whenViewedBy when there are two arguments", function() {
      var whenViewedBy = sinon.spy(ab, "whenViewedBy");
      ab.whenIn(ab.getCohort(), function() {});
      expect(whenViewedBy).to.have.been.executed;
    });

    it("should call addDocumentObserver when there are three arguments", function() {
      var addDocumentObserver = sinon.spy(ab, "addDocumentObserver");
      ab.whenIn(ab.getCohort(), "#price", function() {});
      expect(addDocumentObserver).to.have.been.executed;
    });
  });

  describe("whenViewedBy", function() {
    beforeEach(function() {
      ab.withCohorts(["treatment", "control"]).enrol();
    });

    describe("when the cohort matches", function() {
      it("should execute the callback", function() {
        var callback = sinon.spy();
        ab.whenViewedBy(ab.getCohort(), callback);
        expect(callback).to.have.been.called;
      });
    });

    describe("when the cohort does not match", function() {
      it("should not execute the callback", function() {
        var callback = sinon.spy();
        ab.whenViewedBy("not the right cohort", callback);
        expect(callback).to.not.have.been.called;
      });
    })
  });

  describe("addDocumentObserver", function() {
    beforeEach(function() {
        ab.withCohorts(["treatment", "control"]).enrol();
    });

    describe("when the cohort matches the enrolled cohort", function() {
      it("should add the observer to the observers array", function() {
        var notifyAllDocumentObservers = sinon.spy(ab, "notifyAllDocumentObservers");
        ab.addDocumentObserver(ab.getCohort(), "#cake", function() {});
        expect(notifyAllDocumentObservers).to.have.been.called;
        expect(ab.documentObservers.length).to.equal(1);
      });
    });

    describe("when the cohort doesn't match the enrolled cohort", function() {
      it("should not add an observer to the observers array", function() {
        ab.enrol();
        var cohort = ab.getCohort();
        var otherCohort = ab.cohorts.filter(function(el) {
          return el !== cohort;
        })[0];
        var notifyAllDocumentObservers = sinon.spy(ab, "notifyAllDocumentObservers");
        ab.addDocumentObserver(otherCohort, "#cake", function() {});
        expect(notifyAllDocumentObservers).not.to.have.been.called;
        expect(ab.documentObservers.length).to.equal(0);
      });
    });
  });

  describe("notifyAllDocumentObservers", function() {
    it("should notify each observer", function() {
      var observers = [
        new Observer("#cake", function() {})
      ];
      ab.documentObservers = observers;
      var notify = sinon.spy(observers[0], "notify");
      ab.notifyAllDocumentObservers();
      expect(notify).to.have.been.called;
    });
  });

});
