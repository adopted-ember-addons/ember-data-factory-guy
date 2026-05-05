export default class Sequence {
  constructor(fn) {
    this._fn = fn;
    this._index = 1;
  }

  next() {
    const fn = this._fn;
    return fn(this._index++);
  }

  reset() {
    this._index = 1;
  }
}
