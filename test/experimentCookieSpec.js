require('jsdom');

const chai = require('chai');
// dirty chai let's us say `.to.be.undefined()`, instead of `.to.be.undefined`,
// which breaks eslint rules
const dirtyChai = require('dirty-chai');

const { expect } = chai;
chai.use(dirtyChai);

const ExperimentCookie = require('../lib/experiment-cookie.js');
const Cookies = require('js-cookie');

describe('ExperimentCookie', () => {
  let cookie;

  beforeEach(() => {
    cookie = new ExperimentCookie('AndyAB');
  });

  afterEach(() => {
    Cookies.remove(cookie.name);
  });

  describe('getCohort', () => {
    it('should return undefined when the cookie does not exist', () => {
      const cohort = cookie.getCohort('test1');
      expect(cohort).to.be.undefined();
    });

    describe('when the cookie exists', () => {
      beforeEach(() => {
        Cookies.set(cookie.name, '{}');
      });

      it('should return undefined when the experiment is not present', () => {
        expect(cookie.getCohort('test1')).to.be.undefined();
      });

      it('should return the cohort', () => {
        cookie.setCohort('test1', 'control');
        expect(cookie.getCohort('test1')).to.equal('control');
      });
    });
  });

  describe('setCohort', () => {
    it('should create and set the cookie when it does not exist', () => {
      cookie.setCohort('test1', 'control');
      expect(cookie.getCohort('test1')).to.equal('control');
    });

    describe('when the cookie exists', () => {
      beforeEach(() => {
        Cookies.set(cookie.name, '{}');
      });

      it('should overwrite the existing cohort when the experiment is present', () => {
        cookie.setCohort('test1', 'control');
        cookie.setCohort('test1', 'treatment');
        expect(cookie.getCohort('test1')).to.equal('treatment');
      });

      it('should set the cohort', () => {
        cookie.setCohort('test1', 'treatment');
        expect(cookie.getCohort('test1')).to.equal('treatment');
      });

      it('should allow more than one experiment to be stored', () => {
        cookie.setCohort('test1', 'control');
        cookie.setCohort('test2', 'treatment');
        expect(cookie.getCohort('test1')).to.equal('control');
        expect(cookie.getCohort('test2')).to.equal('treatment');
      });
    });
  });
});
