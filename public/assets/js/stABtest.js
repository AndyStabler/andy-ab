"use strict";

var ABTest = function(name) {
  this.name = name || "";
  this.cohorts = [];
  this.listeners = [];
  this.observer;
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
}

ABTest.prototype.withCohorts = function(cohorts) {
  this.cohorts = cohorts;
  return this;
}

ABTest.prototype.endingAtTime = function(date) {
  this.endTime = date;
  return this;
}

ABTest.prototype.sampleCohort = function() {
  if (this.cohorts.length == 0)
    return;
  var max = this.cohorts.length - 1,
  min = 0,
  cohort = Math.floor(Math.random()*(max-min+1)+min);

  return this.cohorts[cohort]
}

ABTest.prototype.enrol = function(callback) {
  var cohort = this.getCookie("AB" + this.name)
  if (cohort == null) {
    cohort = this.sampleCohort();
    this.setCookie("AB" + this.name, cohort);
    typeof callback === 'function' && callback(cohort);
  }
  return this;
}

ABTest.prototype.getCohort = function() {
  return this.getCookie("AB" + this.name);
}

ABTest.prototype.setCookie = function(key, value) {
  document.cookie = key + '=' + value + ';expires=' + this.endTime;
}

ABTest.prototype.getCookie = function(key) {
  var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
  return keyValue ? keyValue[2] : null;
}

ABTest.prototype.ready = function(selector, callback) {
  this.listeners.push({
    selector: selector,
    callback: callback
  });
  this.check();
}

ABTest.prototype.updateForCohort = function(cohort, selector, callback) {
  if (this.getCohort() == cohort)
    this.ready(selector, callback);
}

ABTest.prototype.check = function() {
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
}
