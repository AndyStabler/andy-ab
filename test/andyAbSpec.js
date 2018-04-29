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

describe('AndyAB', () => {
  let ab;

  beforeEach(() => {
    ab = new AndyAB('AndyAB');
  });

  describe('withCohorts', () => {
    it('calls withCohorts on the experiment', () => {
      const withCohorts = sinon.spy(ab.experiment, 'withCohorts');
      ab.withCohorts('control', 'treatment');
      expect(withCohorts).to.have.been.calledWith('control', 'treatment');
    });
  });

  describe('withExclusions', () => {
    it('calls withExclusions on the experiment', () => {
      const withExclusions = sinon.spy(ab.experiment, 'withExclusions');
      const exclusions = { exclusion1: () => true };
      ab.withExclusions(exclusions);
      expect(withExclusions).to.have.been.calledWith(exclusions);
    });
  });

  describe('withExclusion', () => {
    it('calls withExclusion on the experiment', () => {
      const withExclusion = sinon.spy(ab.experiment, 'withExclusion');
      const exclusion = {
        name: 'already subscribed',
        condition: () => true,
      };
      ab.withExclusion(exclusion.name, exclusion.condition);
      expect(withExclusion).to.have.been.calledWith(exclusion.name, exclusion.condition);
    });
  });

  describe('enrol', () => {
    beforeEach(() => {
      ab.withCohorts('treatment', 'control');
    });

    it('calls enrol on the experiment', () => {
      const enrol = sinon.spy(ab.experiment, 'enrol');
      const callback = () => {};
      ab.enrol(callback);
      expect(enrol).to.have.been.calledWith(callback);
    });
  });

  describe('getCohort', () => {
    it('calls getCohort on the experiment', () => {
      const getCohort = sinon.spy(ab.experiment, 'getCohort');
      ab.getCohort();
      expect(getCohort).to.have.been.called();
    });
  });

  describe('whenIn', () => {
    beforeEach(() => {
      ab.withCohorts('treatment', 'control').enrol();
    });

    it('calls whenIn on the experiment', () => {
      const whenIn = sinon.spy(ab.experiment, 'whenIn');
      const cohort = 'treatment';
      const action = () => {};
      ab.whenIn(cohort, action);
      expect(whenIn).to.have.been.calledWith(cohort, action);
    });
  });
});
