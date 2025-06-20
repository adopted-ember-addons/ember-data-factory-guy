/**
 * RequestManager controls setting up a request mocking system to handle the mocks that are
 * created.
 *
 * For each request type / url like [GET /users] or [POST /user/1]
 * the request manager will assign a RequestWrapper class to handle it's response.
 *
 * This class will take the mock handler classes and assign them to a wrapper,
 * and also allow you to remove the handler or replace it from it's current
 * wrapper to new one.
 */
export default class RequestManager {
  constructor() {}

  _settings = {};

  wrappers = {};

  settings(settings) {
    this._settings = settings;
  }

  // eslint-disable-next-line no-unused-vars
  addHandler(_handler) {}

  /**
   * Remove a handler from the wrapper it was in
   *
   * @param handler
   */
  removeHandler(handler) {
    // get the old type, url info from last mockId
    // in order to find the wrapper it was in
    let { type, url } = handler.mockId,
      key = getKey(type, url),
      wrapper = this.wrappers[key];

    if (wrapper) {
      wrapper.removeHandler(handler);
    }
  }

  /**
   * Replace a handler from old wrapper to new one
   *
   * @param handler
   */
  replaceHandler(handler) {
    this.removeHandler(handler);
    this.addHandler(handler);
  }

  // used for testing
  findWrapper({ handler, type, url }) {
    if (handler) {
      type = handler.getType();
      url = handler.getUrl();
    }
    let key = getKey(type, url);
    return this.wrappers[key];
  }

  async start() {}
  stop() {}
}

export function getKey(type, url) {
  return [type, url].join(' ');
}

export function getTypeUrl(handler) {
  return { type: handler.getType(), url: handler.getUrl() };
}

/**
 * Give each handler a mockId that is an object that holds information
 * about what it is mocking { type, url, num }
 *
 * @param {String} type like GET or POST
 * @param {String} url like '/users'
 * @param {Number} num a sequential number for each handler
 * @param handler
 */
export function assignMockId(type, url, num, handler) {
  handler.mockId = { type, url, num };
}
