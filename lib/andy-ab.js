/*jshint: strict:true*/
var DocumentObserver = require("./document-observer.js");
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
  this.endTime = new Date();
  this.endTime.setDate(this.endTime.getDate() + 1);
  this.endTime = this.endTime.getTime();
  this.cookiePrefix = "AB";
  window.onload = this.releaseObservers.bind(this);
};

AndyAB.prototype.withCohorts = function(cohorts) {
  this.cohorts = cohorts;
  return this;
};

AndyAB.prototype.endingAtTime = function(date) {
  this.endTime = date;
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
  this.setCookie(this.cookieName(), cohort);
  if (typeof callback === 'function') {
    callback(cohort);
  }
  return this;
};

AndyAB.prototype.getCohort = function() {
  return this.getCookie(this.cookieName());
};

AndyAB.prototype.setCookie = function(key, value) {
  document.cookie = key + '=' + value + ';expires=' + this.endTime;
};

AndyAB.prototype.getCookie = function(key) {
  var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
  return keyValue ? keyValue[2] : undefined;
};

AndyAB.prototype.cookieName = function() {
  return this.cookiePrefix + this.name;
};

/**
 * Two types of observer:
 * 1) Viewing observer - the callback is executed as soon as the script is parsed
 *    and the cohort matches
 *    e.g. addObserver("treatment", function() {
 *           // e.g. fire analytics event to signal treatment user viewed page
 *         });
 *
 * 2) Document observer - the callback is executed when the document changes
 *    and the cohort matches
 *    e.g. addObserver("treatment", ".price", function(element) {
 *           element.innerHTML = "2 expensive 4 u";
 *         });
 */
AndyAB.prototype.addObserver = function() {
  if (arguments.length == 2) {
    // execute the function if the cohort matches
    this.whenViewedBy(arguments);
  } else if (arguments.length == 3) {
    this.addDocumentObserver(arguments);
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
