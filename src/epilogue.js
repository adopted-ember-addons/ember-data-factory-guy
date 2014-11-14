  FactoryGuy.testMixin = FactoryGuyTestMixin;
  FactoryGuy.sequence = Sequence;
  FactoryGuy.sequence.missingSequenceError = MissingSequenceError;

  // CommonJS module
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = FactoryGuy;
    }
    exports.FactoryGuy = FactoryGuy;
  }

  // Register as an anonymous AMD module
  if (typeof define === 'function' && define.amd) {
    define('factory-guy', [], function () {
      return FactoryGuy;
    });
  }

  // If there is a window object, that at least has a document property,
  // instantiate and define chance on the window
  if (typeof window === "object" && typeof window.document === "object") {
    window.FactoryGuy = FactoryGuy;
  }
})();
