var Observer = function(selector, callback) {
  this.selector = selector;
  this.callback = callback;
};

Observer.prototype.notify = function() {
  var elements = window.document.querySelectorAll(this.selector);
  var elementsLength = elements.length;
  for (var i = 0; i < elementsLength; i++) {
    var element = elements[i];
    if (!element.ready) {
      element.ready = true;
      this.callback.call(element, element);
    }
  }
};

module.exports = Observer;
