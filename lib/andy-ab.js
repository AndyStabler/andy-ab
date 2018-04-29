const Experiment = require('./experiment.js');

const AndyAB = function AndyAB(experimentName) {
  this.experiment = new Experiment(experimentName);
};

AndyAB.prototype.withCohorts = function withCohorts(...cohorts) {
  this.experiment.withCohorts(...cohorts);
  return this;
};

AndyAB.prototype.withExclusions = function withExclusions(exclusions) {
  this.experiment.withExclusions(exclusions);
  return this;
};

AndyAB.prototype.withExclusion = function withExclusion(cohort, condition) {
  this.experiment.withExclusion(cohort, condition);
  return this;
};

AndyAB.prototype.enrol = function enrol(callback) {
  this.experiment.enrol(callback);
  return this;
};

AndyAB.prototype.getCohort = function getCohort() {
  this.experiment.getCohort();
};

AndyAB.prototype.whenIn = function whenIn(...args) {
  this.experiment.whenIn(...args);
  return this;
};

AndyAB.prototype.experiment = function experiment() {
  return this.experiment;
};

module.exports = AndyAB;
