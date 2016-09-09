var Cookies = require("js-cookie");

var ExperimentCookie = function(name) {
  this.name = name;
};

ExperimentCookie.prototype.getCohort = function(experiment) {
  return this.value() ? this.value()[experiment] : undefined;
};

ExperimentCookie.prototype.setCohort = function(experiment, cohort) {
  var value = this.value() || {};
  value[experiment] = cohort;
  Cookies.set(this.name, value, { 'expires': (365 * 10) });
};

ExperimentCookie.prototype.value = function() {
  return Cookies.getJSON(this.name);
};

module.exports = ExperimentCookie;
