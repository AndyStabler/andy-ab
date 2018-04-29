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

const Experiment = require('../lib/experiment.js');
const Cookies = require('js-cookie');
const Observer = require('../lib/document-observer.js');

describe('Experiment', () => {
  let experiment;

  beforeEach(() => {
    experiment = new Experiment('Experiment');
  });

  afterEach(() => {
    // delete the cohort cookie
    document.cookie = `${experiment.cookiePrefix}${experiment.name}=;expires=${new Date()}`;
  });

  describe('withCohorts', () => {
    it('sets the cohorts array', () => {
      const cohorts = ['control', 'treatment'];
      experiment.withCohorts('control', 'treatment');
      expect(experiment.cohorts).to.eql(cohorts);
    });
  });

  describe('withExclusions', () => {
    it('sets the exclusions object', () => {
      const exclusions = { exclusion1: () => true };
      experiment.withExclusions(exclusions);
      expect(experiment.exclusions).to.equal(exclusions);
    });
  });

  describe('withExclusion', () => {
    it('adds the exclusion to the exclusions object', () => {
      const exclusions = { exclusion1: () => true };
      experiment.withExclusions(exclusions);
      experiment.withExclusion('already subscribed', () => true);
      expect(experiment.exclusions).to.have.property('exclusion1');
      expect(experiment.exclusions).to.have.property('already subscribed');
    });
  });

  describe('sampleCohort', () => {
    it("should raise an error when the cohorts aren't set", () => {
      expect(experiment.sampleCohort).to.throw();
    });

    it('should select a cohort', () => {
      experiment.withCohorts('treatment', 'control');
      const enrolledCohort = experiment.sampleCohort();
      expect(enrolledCohort).to.not.be.undefined();
      expect(experiment.cohorts).to.contain(enrolledCohort);
    });
  });

  describe('enrol', () => {
    beforeEach(() => {
      experiment.withCohorts('treatment', 'control');
    });

    describe('when already enrolled', () => {
      beforeEach(() => {
        experiment.enrol();
      });

      it('should not reset the cookie', () => {
        const setCookie = sinon.spy(Cookies, 'set');
        experiment.enrol();
        expect(setCookie).not.to.have.been.called();
        Cookies.set.restore();
      });

      it('should not execute the enrol callback', () => {
        const callback = sinon.spy();
        experiment.enrol(callback);
        expect(callback).not.to.have.been.called();
      });
    });

    describe('when not already enrolled ', () => {
      beforeEach(() => {
        Cookies.remove(experiment.experimentCookie.name);
      });

      it('should enrol the user into a cohort', () => {
        expect(experiment.getCohort()).to.be.undefined();
        experiment.enrol();
        expect(experiment.getCohort()).to.be.ok();
      });

      it('should execute the enrol callback', () => {
        const callback = sinon.spy();
        experiment.enrol(callback);
        expect(callback).to.have.been.called();
      });

      it('excludes the user when an exclusion condition is true', () => {
        const exclusions = { 'already subscribed': () => true };
        experiment.withExclusions(exclusions);
        experiment.enrol();
        expect(experiment.getCohort()).to.equal('already subscribed');
      });
    });
  });

  describe('enrolled', () => {
    beforeEach(() => {
      experiment.withCohorts('treatment', 'control');
    });

    it('is true when the user is already enrolled', () => {
      experiment.enrol();
      expect(experiment.enrolled()).to.be.true();
    });

    it('is false when the user is not already enrolled', () => {
      Cookies.remove(experiment.experimentCookie.name);
      expect(experiment.enrolled()).to.be.false();
    });
  });

  describe('assignCohort', () => {
    beforeEach(() => {
      experiment.withCohorts('treatment', 'control');
    });

    it('assigns a cohort', () => {
      const cohort = experiment.assignCohort();
      expect(['treatment', 'control']).to.include(cohort);
      expect(experiment.getCohort()).to.equal(cohort);
    });

    it('assigns an exclusion cohort when the user is excluded', () => {
      experiment.withExclusion('excluded', () => true);
      const cohort = experiment.assignCohort();
      expect(cohort).to.equal('excluded');
      expect(experiment.getCohort()).to.equal(cohort);
    });
  });

  describe('exclusionCohort', () => {
    beforeEach(() => {
      experiment.withCohorts('treatment', 'control');
    });

    it('is undefined when there are no exclusions', () => {
      expect(experiment.exclusionCohort()).to.be.undefined();
    });

    it('is undefined when there is not a valid exclusion', () => {
      const exclusions = { 'already subscribed': () => false };
      experiment.withExclusions(exclusions);
      expect(experiment.exclusionCohort()).to.be.undefined();
    });

    it('is the first valid exclusion cohort', () => {
      const exclusions = {
        'already subscribed': () => false,
        'in another campaign': () => true,
      };
      experiment.withExclusions(exclusions);
      expect(experiment.exclusionCohort()).to.equal('in another campaign');
    });
  });

  describe('whenIn', () => {
    beforeEach(() => {
      experiment.withCohorts('treatment', 'control');
      experiment.enrol();
    });

    it('should call whenViewedBy when there are two arguments', () => {
      const whenViewedBy = sinon.spy(experiment, 'whenViewedBy');
      experiment.whenIn(experiment.getCohort(), () => {});
      expect(whenViewedBy).to.have.been.called();
    });

    it('should call addDocumentObserver when there are three arguments', () => {
      const addDocumentObserver = sinon.spy(experiment, 'addDocumentObserver');
      experiment.whenIn(experiment.getCohort(), '#price', () => {});
      expect(addDocumentObserver).to.have.been.called();
    });
  });

  describe('whenViewedBy', () => {
    beforeEach(() => {
      experiment.withCohorts('treatment', 'control');
      experiment.enrol();
    });

    describe('when the cohort matches', () => {
      it('should execute the callback', () => {
        const callback = sinon.spy();
        experiment.whenViewedBy(experiment.getCohort(), callback);
        expect(callback).to.have.been.called();
      });
    });

    describe('when the cohort does not match', () => {
      it('should not execute the callback', () => {
        const callback = sinon.spy();
        experiment.whenViewedBy('not the right cohort', callback);
        expect(callback).to.not.have.been.called();
      });
    });
  });

  describe('addDocumentObserver', () => {
    beforeEach(() => {
      experiment.withCohorts('treatment', 'control');
      experiment.enrol();
    });

    describe('when the cohort matches the enrolled cohort', () => {
      it('should add the observer to the observers array', () => {
        const notifyAllDocumentObservers = sinon.spy(experiment, 'notifyAllDocumentObservers');
        experiment.addDocumentObserver(experiment.getCohort(), '#cake', () => {});
        expect(notifyAllDocumentObservers).to.have.been.called();
        expect(experiment.documentObservers.length).to.equal(1);
      });
    });

    describe("when the cohort doesn't match the enrolled cohort", () => {
      it('should not add an observer to the observers array', () => {
        experiment.enrol();
        const cohort = experiment.getCohort();
        const otherCohort = experiment.cohorts.filter(el => el !== cohort)[0];
        const notifyAllDocumentObservers = sinon.spy(experiment, 'notifyAllDocumentObservers');
        experiment.addDocumentObserver(otherCohort, '#cake', () => {});
        expect(notifyAllDocumentObservers).not.to.have.been.called();
        expect(experiment.documentObservers.length).to.equal(0);
      });
    });
  });

  describe('notifyAllDocumentObservers', () => {
    it('should notify each observer', () => {
      const observers = [
        new Observer('#cake', () => {}),
      ];
      experiment.documentObservers = observers;
      const notify = sinon.spy(observers[0], 'notify');
      experiment.notifyAllDocumentObservers();
      expect(notify).to.have.been.called();
    });
  });
});
