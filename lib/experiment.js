const DocumentObserver = require('./document-observer.js');
const ExperimentCookie = require('./experiment-cookie.js');
const MutationObserver = require('mutation-observer');

const Experiment = function Experiment(name) {
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

Experiment.prototype.withCohorts = function withCohorts(...cohorts) {
  this.cohorts = cohorts;
};

Experiment.prototype.withExclusions = function withExclusions(exclusions) {
  this.exclusions = exclusions;
};

Experiment.prototype.withExclusion = function withExclusion(cohort, condition) {
  this.exclusions[cohort] = condition;
};

Experiment.prototype.enrol = function enrol(callback) {
  if (this.enrolled()) { return; }
  const cohort = this.assignCohort();
  if (typeof callback === 'function') { callback(cohort); }
};

Experiment.prototype.enrolled = function enrolled() {
  return !!this.getCohort();
};

Experiment.prototype.assignCohort = function assignCohort() {
  const cohort = this.exclusionCohort() || this.sampleCohort();
  this.experimentCookie.setCohort(this.name, cohort);
  return cohort;
};

Experiment.prototype.exclusionCohort = function exclusionCohort() {
  return Object.keys(this.exclusions).find(exclusion => this.exclusions[exclusion]());
};

Experiment.prototype.getCohort = function getCohort() {
  return this.experimentCookie.getCohort(this.name);
};

Experiment.prototype.sampleCohort = function sampleCohort() {
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
Experiment.prototype.whenIn = function whenIn(...args) {
  if (args.length === 2) {
    this.whenViewedBy(...args);
  } else if (args.length === 3) {
    this.addDocumentObserver(...args);
  }
};

Experiment.prototype.whenViewedBy = function whenViewedBy(cohort, callback) {
  if (this.getCohort() === cohort) { callback(); }
};

Experiment.prototype.addDocumentObserver = function
addDocumentObserver(cohort, selector, callback) {
  if (this.getCohort() === cohort) {
    this.documentObservers.push(new DocumentObserver(selector, callback));
    this.notifyAllDocumentObservers();
  }
};

Experiment.prototype.notifyAllDocumentObservers = function notifyAllDocumentObservers() {
  const observersLength = this.documentObservers.length;
  for (let i = 0; i < observersLength; i += 1) { this.documentObservers[i].notify(); }
};

Experiment.prototype.releaseObservers = function releaseObservers() {
  this.mutationObserver.disconnect();
};

module.exports = Experiment;
