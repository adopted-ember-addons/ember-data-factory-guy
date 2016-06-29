export default function (fn) {
  let index = 1;
  this.next = function () {
    return fn.call(this, index++);
  };
  this.reset = function () {
    index = 1;
  };
}
