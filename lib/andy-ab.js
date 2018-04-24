const DocumentObserver = require('./document-observer.js');
const ExperimentCookie = require('./experiment-cookie.js');
const MutationObserver = require('mutation-observer');

const AndyAB = function AndyAB(name) {
  this.name = name || '';
  this.cohorts = [];
  this.exclusions = {};
  this.documentObservers = [];
  this.mutationObserver = new MutationObserver(this.notifyAllDocumentObservers.bind(this));
  this.mutationObserver.observe(window.document, {
    childList: true,
    subtree: true,
  });
  this.experimentCookie = new ExperimentCookie('AndyAB');
  window.onload = this.releaseObservers.bind(this);
};

AndyAB.prototype.withCohorts = function withCohorts(...cohorts) {
  this.cohorts = cohorts;
  return this;
};

AndyAB.prototype.withExclusions = function withExclusions(exclusions) {
  this.exclusions = exclusions;
  return this;
};

AndyAB.prototype.withExclusion = function withExclusion(cohort, condition) {
  this.exclusions[cohort] = condition;
  return this;
};

AndyAB.prototype.enrol = function enrol(callback) {
  if (this.alreadyEnrolled()) { return this; }
  const cohort = this.exclusionCohort() || this.sampleCohort();
  this.experimentCookie.setCohort(this.name, cohort);
  if (typeof callback === 'function') { callback(cohort); }
  return this;
};

AndyAB.prototype.alreadyEnrolled = function alreadyEnrolled() {
  return !!this.getCohort();
};

AndyAB.prototype.exclusionCohort = function exclusionCohort() {
  return Object.keys(this.exclusions).find(exclusion => this.exclusions[exclusion]());
};

AndyAB.prototype.getCohort = function getCohort() {
  return this.experimentCookie.getCohort(this.name);
};

AndyAB.prototype.sampleCohort = function sampleCohort() {
  if (this.cohorts.length === 0) { throw new Error('There are no cohorts to choose from'); }
  const max = this.cohorts.length - 1;
  const min = 0;
  const cohort = (Math.floor(Math.random() * ((max - min) + 1)) + min);

  return this.cohorts[cohort];
};

/**
 * Executes a callback when the cohort passed in matches the cohort the user
 * is enrolled into. If a selector is passed in, then the callback will be
 * executed when the DOM changes and a new matching HTML element is found.
 *
 * whenIn(cohort[, selector], callback)
 *
 * e.g.
 * whenIn('treatment', function () { console.log('treatment viewed page'); });
 * whenIn('treatment', '.price', function (element) {
 *     element.innerHTML = '2 expensive 4 u';
 *   });
 */
AndyAB.prototype.whenIn = function whenIn(...args) {
  if (args.length === 2) {
    return this.whenViewedBy(...args);
  } else if (args.length === 3) {
    return this.addDocumentObserver(...args);
  }
  return this;
};

AndyAB.prototype.whenViewedBy = function whenViewedBy(cohort, callback) {
  if (this.getCohort() === cohort) { callback(); }
  return this;
};

AndyAB.prototype.addDocumentObserver = function addDocumentObserver(cohort, selector, callback) {
  if (this.getCohort() === cohort) {
    this.documentObservers.push(new DocumentObserver(selector, callback));
    this.notifyAllDocumentObservers();
  }
  return this;
};

AndyAB.prototype.notifyAllDocumentObservers = function notifyAllDocumentObservers() {
  const observersLength = this.documentObservers.length;
  for (let i = 0; i < observersLength; i += 1) { this.documentObservers[i].notify(); }
};

AndyAB.prototype.releaseObservers = function releaseObservers() {
  this.mutationObserver.disconnect();
};

module.exports = AndyAB;
