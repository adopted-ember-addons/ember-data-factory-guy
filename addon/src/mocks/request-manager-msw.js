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

export default class RequestManagerMSW extends RequestManager {
  constructor(msw) {
    super();
    if (msw) {
      this.msw = msw;
      return;
    }

    if (macroCondition(dependencySatisfies('msw', '*'))) {
      const { setupWorker } = importSync('msw/browser');
      msw = new setupWorker();
      this.msw = msw;
    } else {
      throw new Error('RequestManagerMSW needs msw dependency');
    }
  }

  get handlers() {
    return this.msw.listHandlers();
  }

  static addHandler(handler) {
    const { http, delay } = importSync('msw');

    let { type, url } = getTypeUrl(handler),
      key = getKey(type, url),
      wrapper = this.wrappers[key];

    if (!wrapper) {
      wrapper = new RequestWrapper();
      const mswHandler = http[type.toLowerCase()].call(
        this.msw,
        url,
        async ({ request }) => {
          await delay(this._settings.delay);
          wrapper(request);
        },
      );
      this.msw.use(mswHandler);
      this.wrappers[key] = wrapper;
    }

    let index = wrapper.addHandler(handler);
    assignMockId(type, url, index, handler);
  }

  async start() {
    await this.msw.start();
  }
  stop() {
    this.msw.stop();
  }
}
