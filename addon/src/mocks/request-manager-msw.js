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
  _settings = {
    delay: 0,
    quiet: true, // quiet by default makes tests a lot faster
  };

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

  addHandler(handler) {
    const { http, delay } = importSync('msw');

    let { type, url } = getTypeUrl(handler),
      key = getKey(type, url),
      wrapper = this.wrappers[key];

    if (!wrapper) {
      wrapper = new RequestWrapper(); // this generates & returns the handler function
      const mswHandler = http[type.toLowerCase()].call(
        this.msw,
        url,
        async ({ request, params }) => {
          await delay(this._settings.delay);
          return await wrapper({ request: request.clone(), params });
        },
      );
      this.msw.use(mswHandler);
      this.wrappers[key] = wrapper;
    }

    let index = wrapper.addHandler(handler);
    assignMockId(type, url, index, handler);
  }

  async start() {
    await this.msw.start({ quiet: this._settings.quiet });
  }
  stop() {
    this.msw.stop();
  }
}
