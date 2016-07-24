describe("AndyAB", function() {
  var ab;

  beforeEach(function() {
    ab = new AndyAB("AndyAB");
  });

  describe("sampleCohort", function() {
    it("should be null when cohorts aren't set", function() {
      expect("test").toEqual("test");
    });
    it("should select a cohort", function() {
      expect("test").toEqual("test");
    });
  });

  describe("enrol", function() {
    describe("when already enrolled", function() {
      it("should not enrol the user into a cohort", function() {
        expect("test").toEqual("test");
      });
      it("should not execute the enrol callback", function() {
        expect("test").toEqual("test");
      });
    });
    describe("when not already enrolled ", function(){
      it("should enrol the user into a cohort", function() {
        expect("test").toEqual("test");
      });
      it("should execute the enrol callback", function() {
        expect("test").toEqual("test");
      });
    });
  });

  describe("getCohort", function() {
    describe("when the cookie prefix is set", function() {
      it("should add the cookie prefix", function() {
        expect("test").toEqual("test");
      });
    });
    describe("when the cookie prefix is not set", function() {
      it("should return the name of the cookie without a prefix", function() {
        expect("test").toEqual("test");
      });
    });
  });

  describe("ready", function() {
    it("should add the listener to the listeners array", function() {
      expect("test").toEqual("test");
    });
  });

  describe("updateForCohort", function() {
    describe("when the cohort matches the enrolled cohort", function() {
      it("should add a listener", function() {
        expect("test").toEqual("test");
      });
    });
    describe("when the cohort doesn't match the enroled cohort", function() {
      it("should not add a listener", function() {
        expect("test").toEqual("test");
      });
    });
  });

  describe("check", function() {
    // TODO
  });

});
