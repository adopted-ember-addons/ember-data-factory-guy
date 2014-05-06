Sequence = function (fn) {
  var index = 1;
  var fn = fn;

  this.next = function () {
    return fn.call(this, index++);
  }

  this.reset = function () {
    index = 1;
  }
}

function MissingSequenceError(message) {
  this.toString = function() { return message }
}
