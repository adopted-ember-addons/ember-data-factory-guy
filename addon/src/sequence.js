export default class Sequence {
  constructor(fn) {
    this._fn = fn;
    this._index = 1;
  }

  next() {
    return this._fn(this._index++);
  }

  reset() {
    this._index = 1;
  }
}
