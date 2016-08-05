var AndyAB = require("../lib/andy-ab.js");
var Observer = require("./../lib/observer.js");

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
      expect(ab.sampleCohort).toThrow();
    });

    it("should select a cohort", function() {
      ab.withCohorts(["treatment", "control"]);
      enrolledCohort = ab.sampleCohort();
      expect(enrolledCohort).toBeDefined();
      expect(ab.cohorts).toContain(enrolledCohort);
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
        var setCookie = spyOn(ab, "setCookie");
        ab.enrol();
        expect(setCookie).not.toHaveBeenCalled();
      });

      it("should not execute the enrol callback", function() {
        var callback = jasmine.createSpy("enrolled!");
        ab.enrol(callback);
        expect(callback).not.toHaveBeenCalled();
      });
    });

    describe("when not already enrolled ", function(){
      it("should enrol the user into a cohort", function() {
        expect(ab.getCohort()).toEqual("");
        ab.enrol();
        expect(ab.getCohort()).toBeTruthy();
      });

      it("should execute the enrol callback", function() {
        var callback = jasmine.createSpy("enrolled!");
        ab.enrol(callback);
        expect(callback).toHaveBeenCalled();
      });
    });
  });

  describe("cookieName", function() {
    describe("when the cookie prefix is set", function() {
      it("should include the prefix", function() {
        ab.cookiePrefix = "prefix";
        expect(ab.cookieName()).toEqual(ab.cookiePrefix + ab.name);
      });
    });

    describe("when the cookie prefix is not set", function() {
      it("should not include a prefix", function() {
        ab.cookiePrefix = "";
        expect(ab.cookieName()).toEqual(ab.name);
      });
    });
  });

  describe("addObserver", function() {
    beforeEach(function() {
        ab.withCohorts(["treatment", "control"]).enrol();
    });

    describe("when the cohort matches the enrolled cohort", function() {
      it("should add the observer to the observers array", function() {
        var notifyAllObservers = spyOn(ab, "notifyAllObservers");
        ab.addObserver(ab.getCohort(), "#cake", function() {});
        expect(notifyAllObservers).toHaveBeenCalled();
        expect(ab.observers.length).toBe(1);
      });
    });

    describe("when the cohort doesn't match the enrolled cohort", function() {
      it("should not add an observer to the observers array", function() {
        ab.enrol();
        var cohort = ab.getCohort();
        var otherCohort = ab.cohorts.filter(function(el) {
          return el !== cohort;
        })[0];
        var notifyAllObservers = spyOn(ab, "notifyAllObservers");
        ab.addObserver(otherCohort, "#cake", function() {});
        expect(notifyAllObservers).not.toHaveBeenCalled();
        expect(ab.observers.length).toBe(0);
      });
    });
  });

  describe("notifyAllObservers", function() {
    it("should notify each observer", function() {
      observers = [
        new Observer("#cake", function() {}),
        new Observer("#cake", function() {}),
        new Observer("#cake", function() {})
      ];
      ab.observers = observers;
      var spies = [];
      observers.forEach(function(el, index) {
        spies[index] = spyOn(el, "notify");
      });
      ab.notifyAllObservers();
      spies.forEach(function(el) {
        expect(el.notify).toHaveBeenCalled();
      });
    });
  });

});
