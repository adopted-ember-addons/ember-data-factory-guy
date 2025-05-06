import { isPresent } from '@ember/utils';
import RequestWrapper from './request-wrapper';
import Pretender from 'pretender';

let wrappers = {},
  pretender = null,
  delay = 0;

/**
 * RequestManager controls setting up pretender to handle the mocks that are
 * created.
 *
 * For each request type / url like [GET /users] or [POST /user/1]
 * the request manager will assign a RequestWrapper class to handle it's response.
 *
 * This class will take the mock handler classes and assign them to a wrapper,
 * and also allow you to remove the handler or replace it from it's current
 * wrapper to new one.
 */
export default class {
  /**
   * For now, you can only set the response delay.
   *
   * @param {Number} responseTime
   * @returns {{responseTime: number}} the current settings
   */
  static settings({ responseTime } = {}) {
    if (isPresent(responseTime)) {
      delay = responseTime;
    }
    // return current settings
    return { responseTime: delay };
  }

  static getKey(type, url) {
    return [type, url].join(' ');
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
  static assignMockId(type, url, num, handler) {
    handler.mockId = { type, url, num };
  }

  /**
   * Add a handler to the correct wrapper and assign it a mockId
   *
   * @param handler
   */
  static addHandler(handler) {
    let { type, url } = this.getTypeUrl(handler),
      key = this.getKey(type, url),
      wrapper = wrappers[key];

    if (!wrapper) {
      wrapper = new RequestWrapper();
      this.getPretender()[type.toLowerCase()].call(
        pretender,
        url,
        wrapper,
        delay
      );
      wrappers[key] = wrapper;
    }

    let index = wrapper.addHandler(handler);
    this.assignMockId(type, url, index, handler);
  }

  /**
   * Remove a handler from the wrapper it was in
   *
   * @param handler
   */
  static removeHandler(handler) {
    // get the old type, url info from last mockId
    // in order to find the wrapper it was in
    let { type, url } = handler.mockId,
      key = this.getKey(type, url),
      wrapper = wrappers[key];

    if (wrapper) {
      wrapper.removeHandler(handler);
    }
  }

  /**
   * Replace a handler from old wrapper to new one
   *
   * @param handler
   */
  static replaceHandler(handler) {
    this.removeHandler(handler);
    this.addHandler(handler);
  }

  // used for testing
  static findWrapper({ handler, type, url }) {
    if (handler) {
      type = handler.getType();
      url = handler.getUrl();
    }
    let key = this.getKey(type, url);
    return wrappers[key];
  }

  static getTypeUrl(handler) {
    return { type: handler.getType(), url: handler.getUrl() };
  }

  static reset() {
    wrappers = {};
    pretender && pretender.shutdown();
    pretender = null;
    delay = 0;
  }

  static getPretender() {
    if (!pretender) {
      pretender = new Pretender();
    }
    return pretender;
  }
}
