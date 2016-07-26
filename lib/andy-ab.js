/*jshint: strict:true*/

var AndyAB = function(name) {
  this.name = name || "";
  this.cohorts = [];
  this.listeners = [];
  this.MutationObserver = window.MutationObserver ||
    window.WebKitMutationObserver ||
    window.MozMutationObserver;
  this.observer = new MutationObserver(this.check.bind(this));
  this.observer.observe(window.document, {
    childList: true,
    subtree: true
  });
  this.endTime = new Date();
  this.endTime.setDate(this.endTime.getDate() + 1);
  this.endTime = this.endTime.getTime();
  this.cookiePrefix = "AB";
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
  var cohort = this.getCookie(this.cookiePrefix + this.name);
  if (cohort === null) {
    cohort = this.sampleCohort();
    this.setCookie(this.cookiePrefix + this.name, cohort);
    if (typeof callback === 'function')
      callback(cohort);
  }
  return this;
};

AndyAB.prototype.getCohort = function() {
  return this.getCookie(this.cookiePrefix + this.name);
};

AndyAB.prototype.setCookie = function(key, value) {
  document.cookie = key + '=' + value + ';expires=' + this.endTime;
};

AndyAB.prototype.getCookie = function(key) {
  var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
  return keyValue ? keyValue[2] : null;
};

AndyAB.prototype.ready = function(selector, callback) {
  this.listeners.push({
    selector: selector,
    callback: callback
  });
  this.check();
};

AndyAB.prototype.updateForCohort = function(cohort, selector, callback) {
  if (this.getCohort() == cohort)
    this.ready(selector, callback);
};

AndyAB.prototype.check = function() {
  var listenersLength = this.listeners.length, listener, elements;
  for (var i = 0; i < listenersLength; i++) {
    listener = this.listeners[i];
    elements = window.document.querySelectorAll(listener.selector);
    var elementsLength = elements.length, element;
    for (var j = 0; j < elementsLength; j++) {
      element = elements[j];
      if (!element.ready) {
        element.ready = true;
        listener.callback.call(element, element);
      }
    }
  }
};

module.exports = AndyAB;
