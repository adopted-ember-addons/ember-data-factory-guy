import MockStoreRequest from './mock-store-request';
import MaybeIdUrlMatch from './maybe-id-url-match';

export default class MockDeleteRequest extends MaybeIdUrlMatch(MockStoreRequest) {
  constructor(modelName, id) {
    super(modelName, 'deleteRecord');
    this.id = id;
    this.setupHandler();
  }

  getType() {
    return "DELETE";
  }

}
