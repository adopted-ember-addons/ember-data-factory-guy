import {
  macroCondition,
  dependencySatisfies,
  importSync,
} from '@embroider/macros';
import RequestWrapper from './request-wrapper';
import RequestManager, {
  getKey,
  getTypeUrl,
  assignMockId,
} from './request-manager';

export default class RequestManagerPretender extends RequestManager {
  constructor(pretender) {
    super();
    if (pretender) {
      this.pretender = pretender;
      return;
    }

    if (macroCondition(dependencySatisfies('pretender', '*'))) {
      const { default: Pretender } = importSync('pretender');
      pretender = new Pretender();
      this.pretender = pretender;
    } else {
      throw new Error('RequestManagerPretender needs pretender dependency');
    }
  }

  /**
   * For now, you can only set the response delay.
   */
  settings(settings = {}) {
    super.setttings({
      ...settings,
      delay: settings.responseTime ?? settings.delay ?? 0,
    });
  }

  /**
   * Add a handler to the correct wrapper and assign it a mockId
   *
   * @param handler
   */
  addHandler(handler) {
    let { type, url } = getTypeUrl(handler),
      key = getKey(type, url),
      wrapper = this.wrappers[key];

    if (!wrapper) {
      wrapper = new RequestWrapper();
      this.pretender[type.toLowerCase()].call(
        this.pretender,
        url,
        wrapper,
        this._settings.delay,
      );
      this.wrappers[key] = wrapper;
    }

    let index = wrapper.addHandler(handler);
    assignMockId(type, url, index, handler);
  }

  async start() {
    // auto-start
  }

  stop() {
    this.pretender.shutdown();
  }
}
