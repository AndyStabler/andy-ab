require('jsdom-global')();
require('jsdom');

const chai = require('chai');
// dirty chai let's us say `.to.be.undefined()`, instead of `.to.be.undefined`,
// which breaks eslint rules
const dirtyChai = require('dirty-chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const { expect } = chai;
chai.use(sinonChai);
chai.use(dirtyChai);

const AndyAB = require('../lib/andy-ab.js');
const Cookies = require('js-cookie');
const Observer = require('../lib/document-observer.js');

describe('AndyAB', () => {
  let ab;

  beforeEach(() => {
    ab = new AndyAB('AndyAB');
  });

  afterEach(() => {
    // delete the cohort cookie
    document.cookie = `${ab.cookiePrefix}${ab.name}=;expires=${new Date()}`;
  });

  describe('withCohorts', () => {
    it('sets the cohorts array', () => {
      const cohorts = ['control', 'treatment'];
      ab.withCohorts('control', 'treatment');
      expect(ab.cohorts).to.eql(cohorts);
    });
  });

  describe('withExclusions', () => {
    it('sets the exclusions object', () => {
      const exclusions = { exclusion1: () => true };
      ab.withExclusions(exclusions);
      expect(ab.exclusions).to.equal(exclusions);
    });
  });

  describe('withExclusion', () => {
    it('adds the exclusion to the exclusions object', () => {
      const exclusions = { exclusion1: () => true };
      ab.withExclusions(exclusions);
      ab.withExclusion('already subscribed', () => true);
      expect(ab.exclusions).to.have.property('exclusion1');
      expect(ab.exclusions).to.have.property('already subscribed');
    });
  });

  describe('sampleCohort', () => {
    it("should raise an error when the cohorts aren't set", () => {
      expect(ab.sampleCohort).to.throw();
    });

    it('should select a cohort', () => {
      ab.withCohorts('treatment', 'control');
      const enrolledCohort = ab.sampleCohort();
      expect(enrolledCohort).to.not.be.undefined();
      expect(ab.cohorts).to.contain(enrolledCohort);
    });
  });

  describe('enrol', () => {
    beforeEach(() => {
      ab.withCohorts('treatment', 'control');
    });

    describe('when already enrolled', () => {
      beforeEach(() => {
        ab.enrol();
      });

      it('should not reset the cookie', () => {
        const setCookie = sinon.spy(Cookies, 'set');
        ab.enrol();
        expect(setCookie).not.to.have.been.called();
      });

      it('should not execute the enrol callback', () => {
        const callback = sinon.spy();
        ab.enrol(callback);
        expect(callback).not.to.have.been.called();
      });
    });

    describe('when not already enrolled ', () => {
      beforeEach(() => {
        Cookies.remove(ab.experimentCookie.name);
      });

      it('should enrol the user into a cohort', () => {
        expect(ab.getCohort()).to.be.undefined();
        ab.enrol();
        expect(ab.getCohort()).to.be.ok();
      });

      it('should execute the enrol callback', () => {
        const callback = sinon.spy();
        ab.enrol(callback);
        expect(callback).to.have.been.called();
      });

      it('excludes the user when an exclusion condition is true', () => {
        const exclusions = { 'already subscribed': () => true };
        ab.withExclusions(exclusions);
        ab.enrol();
        expect(ab.getCohort()).to.equal('already subscribed');
      });
    });
  });

  describe('enrolled', () => {
    beforeEach(() => {
      ab.withCohorts('treatment', 'control');
    });

    it('is true when the user is already enrolled', () => {
      ab.enrol();
      expect(ab.enrolled()).to.be.true();
    });

    it('is false when the user is not already enrolled', () => {
      Cookies.remove(ab.experimentCookie.name);
      expect(ab.enrolled()).to.be.false();
    });
  });

  describe('assignCohort', () => {
    beforeEach(() => {
      ab.withCohorts('treatment', 'control');
    });

    it('assigns a cohort', () => {
      const cohort = ab.assignCohort();
      expect(['treatment', 'control']).to.include(cohort);
      expect(ab.getCohort()).to.equal(cohort);
    });

    it('assigns an exclusion cohort when the user is excluded', () => {
      ab.withExclusion('excluded', () => true);
      const cohort = ab.assignCohort();
      expect(cohort).to.equal('excluded');
      expect(ab.getCohort()).to.equal(cohort);
    });
  });

  describe('exclusionCohort', () => {
    beforeEach(() => {
      ab.withCohorts('treatment', 'control');
    });

    it('is undefined when there are no exclusions', () => {
      expect(ab.exclusionCohort()).to.be.undefined();
    });

    it('is undefined when there is not a valid exclusion', () => {
      const exclusions = { 'already subscribed': () => false };
      ab.withExclusions(exclusions);
      expect(ab.exclusionCohort()).to.be.undefined();
    });

    it('is the first valid exclusion cohort', () => {
      const exclusions = {
        'already subscribed': () => false,
        'in another campaign': () => true,
      };
      ab.withExclusions(exclusions);
      expect(ab.exclusionCohort()).to.equal('in another campaign');
    });
  });

  describe('whenIn', () => {
    beforeEach(() => {
      ab.withCohorts('treatment', 'control').enrol();
    });

    it('should call whenViewedBy when there are two arguments', () => {
      const whenViewedBy = sinon.spy(ab, 'whenViewedBy');
      ab.whenIn(ab.getCohort(), () => {});
      expect(whenViewedBy).to.have.been.called();
    });

    it('should call addDocumentObserver when there are three arguments', () => {
      const addDocumentObserver = sinon.spy(ab, 'addDocumentObserver');
      ab.whenIn(ab.getCohort(), '#price', () => {});
      expect(addDocumentObserver).to.have.been.called();
    });
  });

  describe('whenViewedBy', () => {
    beforeEach(() => {
      ab.withCohorts('treatment', 'control').enrol();
    });

    describe('when the cohort matches', () => {
      it('should execute the callback', () => {
        const callback = sinon.spy();
        ab.whenViewedBy(ab.getCohort(), callback);
        expect(callback).to.have.been.called();
      });
    });

    describe('when the cohort does not match', () => {
      it('should not execute the callback', () => {
        const callback = sinon.spy();
        ab.whenViewedBy('not the right cohort', callback);
        expect(callback).to.not.have.been.called();
      });
    });
  });

  describe('addDocumentObserver', () => {
    beforeEach(() => {
      ab.withCohorts('treatment', 'control').enrol();
    });

    describe('when the cohort matches the enrolled cohort', () => {
      it('should add the observer to the observers array', () => {
        const notifyAllDocumentObservers = sinon.spy(ab, 'notifyAllDocumentObservers');
        ab.addDocumentObserver(ab.getCohort(), '#cake', () => {});
        expect(notifyAllDocumentObservers).to.have.been.called();
        expect(ab.documentObservers.length).to.equal(1);
      });
    });

    describe("when the cohort doesn't match the enrolled cohort", () => {
      it('should not add an observer to the observers array', () => {
        ab.enrol();
        const cohort = ab.getCohort();
        const otherCohort = ab.cohorts.filter(el => el !== cohort)[0];
        const notifyAllDocumentObservers = sinon.spy(ab, 'notifyAllDocumentObservers');
        ab.addDocumentObserver(otherCohort, '#cake', () => {});
        expect(notifyAllDocumentObservers).not.to.have.been.called();
        expect(ab.documentObservers.length).to.equal(0);
      });
    });
  });

  describe('notifyAllDocumentObservers', () => {
    it('should notify each observer', () => {
      const observers = [
        new Observer('#cake', () => {}),
      ];
      ab.documentObservers = observers;
      const notify = sinon.spy(observers[0], 'notify');
      ab.notifyAllDocumentObservers();
      expect(notify).to.have.been.called();
    });
  });
});
