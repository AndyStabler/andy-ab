const DocumentObserver = function DocumentObserver(selector, callback) {
  this.selector = selector;
  this.callback = callback;
};

DocumentObserver.prototype.notify = function notify() {
  const elements = document.querySelectorAll(this.selector);
  const elementsLength = elements.length;
  for (let i = 0; i < elementsLength; i += 1) {
    const element = elements[i];
    if (!element.ready) {
      element.ready = true;
      this.callback.call(element, element);
    }
  }
};

module.exports = DocumentObserver;
