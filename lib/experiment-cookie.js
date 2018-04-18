const Cookies = require('js-cookie');

const ExperimentCookie = function ExperimentCookieExperimentCookie(name) {
  this.name = name;
};

ExperimentCookie.prototype.getCohort = function getCohort(experiment) {
  return this.value() ? this.value()[experiment] : undefined;
};

ExperimentCookie.prototype.setCohort = function setCohort(experiment, cohort) {
  const value = this.value() || {};
  value[experiment] = cohort;
  Cookies.set(this.name, value, { expires: (365 * 10) });
};

ExperimentCookie.prototype.value = function value() {
  return Cookies.getJSON(this.name);
};

module.exports = ExperimentCookie;
