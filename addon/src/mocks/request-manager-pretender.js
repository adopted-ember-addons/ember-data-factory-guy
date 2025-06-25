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
      this.pretender[type.toLowerCase()](
        url,
        async (fakeRequest) => {
          // Turn pretenders fake request object into a Request instance
          const body =
            fakeRequest.method !== 'GET' && fakeRequest.method !== 'HEAD'
              ? { body: fakeRequest.requestBody }
              : {};
          // Pretender also stubs window.Request so this isn't native either, but it's closer.
          const theRequest = new Request(fakeRequest.url, {
            method: fakeRequest.method,
            ...body,
          });
          // Pretenders' Request doesn't support calling request.formData(), just stub it. And make it survive a clone.
          const request = theRequest.clone();
          request.clone = () => {
            const cl = theRequest.clone();
            cl.clone = request.clone;
            cl.formData = async () => {
              return fakeRequest.requestBody instanceof FormData
                ? Promise.resolve(fakeRequest.requestBody)
                : fakeRequest.formData();
            };
            return cl;
          };

          const response = await wrapper({
            request: request.clone(),
            params: fakeRequest.params,
          });
          if (!response) return;

          // Turn Response into the response array that pretender expects
          const responseHeaders = {};
          response.headers.forEach(
            (value, key) => (responseHeaders[key] = value),
          );
          return [response.status, responseHeaders, await response.text()];
        },
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
