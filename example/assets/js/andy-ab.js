(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.AndyAB = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
    return;
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

},{}]},{},[1])(1)
});