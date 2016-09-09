/*jshint: strict:true*/
var DocumentObserver = require("./document-observer.js");
var ExperimentCookie = require("./experiment-cookie.js");
var MutationObserver = require("mutation-observer");

var AndyAB = function(name) {
  this.name = name || "";
  this.cohorts = [];
  this.documentObservers = [];
  this.mutationObserver = new MutationObserver(this.notifyAllDocumentObservers.bind(this));
  this.mutationObserver.observe(window.document, {
    childList: true,
    subtree: true
  });
  this.experimentCookie = new ExperimentCookie("AndyAB");
  window.onload = this.releaseObservers.bind(this);
};

AndyAB.prototype.withCohorts = function(cohorts) {
  this.cohorts = cohorts;
  return this;
};

AndyAB.prototype.sampleCohort = function() {
  if (this.cohorts.length === 0)
    throw "There are no cohorts to choose from";
  var max = this.cohorts.length - 1,
  min = 0,
  cohort = Math.floor(Math.random()*(max-min+1)+min);

  return this.cohorts[cohort];
};

AndyAB.prototype.enrol = function(callback) {
  var cohort = this.getCohort();
  if (cohort)
    return this;
  cohort = this.sampleCohort();
  this.experimentCookie.setCohort(this.name, cohort);
  if (typeof callback === 'function') {
    callback(cohort);
  }
  return this;
};

AndyAB.prototype.getCohort = function() {
  return this.experimentCookie.getCohort(this.name);
};

/**
 * Executes a callback when the cohort passed in matches the cohort the user
 * is enrolled into. If a selector is passed in, then the callback will be
 * executed when the DOM changes and a new matching HTML element is found.
 *
 * whenIn(cohort, [selector,] callback)
 *
 * e.g.
 * whenIn("treatment", function() { console.log("treatment viewed page"); });
 * whenIn("treatment", ".price", function(element) {
 *     element.innerHTML = "2 expensive 4 u";
 *   });
 */
AndyAB.prototype.whenIn = function() {
  if (arguments.length == 2) {
    return this.whenViewedBy.apply(this, arguments);
  } else if (arguments.length == 3) {
    return this.addDocumentObserver.apply(this, arguments);
  }
  return this;
};

AndyAB.prototype.whenViewedBy = function(cohort, callback) {
  if (this.getCohort() == cohort)
    callback();
  return this;
};

AndyAB.prototype.addDocumentObserver = function(cohort, selector, callback) {
  if (this.getCohort() == cohort) {
    this.documentObservers.push(new DocumentObserver(selector, callback));
    this.notifyAllDocumentObservers();
  }
  return this;
};

AndyAB.prototype.notifyAllDocumentObservers = function() {
  var observersLength = this.documentObservers.length;
  for (var i = 0; i < observersLength; i++)
    this.documentObservers[i].notify();
};

AndyAB.prototype.releaseObservers = function() {
  this.mutationObserver.disconnect();
};

module.exports = AndyAB;
