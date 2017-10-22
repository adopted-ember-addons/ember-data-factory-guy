import RequestWrapper from './request-wrapper';
import Pretender from 'pretender';

let wrappers = {};
let pretender = null;

export default class {

  static getKey(type, url) {
    return [type, url].join(' ');
  }

  static assignHandlerId(type, url, index, handler) {
    handler.mockId = { type, url, num: index };
  }

  static addHandler(handler) {
    //    console.log('addHandler A ', type, url, 'handler.index:', handler.index, 'wrapper keys:',Object.keys(wrappers).length);
    //    if (handler.id) {
    //      return;
    //    }

    let { type, url } = this.getTypeUrl(handler),
        key           = this.getKey(type, url),
        wrapper       = wrappers[key];
    if (!wrapper) {
      wrapper = new RequestWrapper();
      this.getPretender()[type.toLowerCase()].call(pretender, url, wrapper);
      wrappers[key] = wrapper;
    }
    let index = wrapper.addHandler(handler);
    this.assignHandlerId(type, url, index, handler);
    //    console.log('addHandler',key, handler.index, wrapper.indexes());
  }

  static findWrapper({ handler, type, url }) {
    if (handler) {
      type = handler.getType();
      url = handler.getUrl();
    }
    let key = this.getKey(type, url);
    return wrappers[key];
  }

  static removeHandler(handler) {
    let { type, url } = handler.mockId,
        key           = this.getKey(type, url),
        wrapper       = wrappers[key];

    if (wrapper) {
      wrapper.removeHandler(handler);
    }
    //    console.log('removeHandler wrapper:',key, 'num:',wrapper.num());
    //    handler.index = undefined;
  }

  static replaceHandler(handler) {
    this.removeHandler(handler);
    this.addHandler(handler);
  }

  static getTypeUrl(handler) {
    return { type: handler.getType(), url: handler.getUrl() };
  }

  static reset() {
    wrappers = {};
    pretender && pretender.shutdown();
    pretender = null;
  }

  static getPretender() {
    if (!pretender) {
      pretender = new Pretender();
    }
    return pretender;
  }
}
