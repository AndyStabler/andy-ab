/*jshint: strict:true*/
var Observer = require("./observer.js");
var MutationObserver = require('mutation-observer');

var AndyAB = function(name) {
  this.name = name || "";
  this.cohorts = [];
  this.observers = [];
  this.observer = new MutationObserver(this.notifyAllObservers.bind(this));
  this.observer.observe(window.document, {
    childList: true,
    subtree: true
  });
  this.endTime = new Date();
  this.endTime.setDate(this.endTime.getDate() + 1);
  this.endTime = this.endTime.getTime();
  this.cookiePrefix = "AB";
  console.log("this is" + this);
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

AndyAB.prototype.addObserver = function(cohort, selector, callback) {
  if (this.getCohort() == cohort) {
    this.observers.push(new Observer(selector, callback));
    this.notifyAllObservers();
  }
};

AndyAB.prototype.notifyAllObservers = function() {
  console.log("Notifying all observers");
  var observersLength = this.observers.length;
  for (var i = 0; i < observersLength; i++)
    this.observers[i].notify();
};

AndyAB.prototype.releaseObservers = function() {
  this.observer.disconnect();
};

module.exports = AndyAB;
