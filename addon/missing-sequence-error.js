export default function(message) {
  this.toString = function () {
    return message;
  };
}
