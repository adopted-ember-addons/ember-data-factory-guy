var Sequence = function (fn) {
  var index = 1;
  this.next = function () {
    return fn.call(this, index++);
  };
  this.reset = function () {
    index = 1;
  };
};

var MissingSequenceError = function(message) {
  this.toString = function () {
    return message;
  };
};