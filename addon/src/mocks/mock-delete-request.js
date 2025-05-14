import MockStoreRequest from './mock-store-request';

export default class MockDeleteRequest extends MockStoreRequest {
  constructor(modelName, { id, model } = {}) {
    super(modelName, 'deleteRecord');
    this.id = id;
    this.model = model;
    this.setupHandler();
  }

  getType() {
    return 'DELETE';
  }

  /**
   *
   * @returns {String} url
   */
  getUrl() {
    let url = super.getUrl();
    if (!this.id) {
      url = `${url}/:id`;
    }
    return url;
  }
}
