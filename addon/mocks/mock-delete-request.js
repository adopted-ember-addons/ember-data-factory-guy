import MockTypedRequest from './mock-typed-request';
import MaybeIdUrlMatch from './maybe-id-url-match';

export default class MockDeleteRequest extends MaybeIdUrlMatch(MockTypedRequest) {
  constructor(modelName, id) {
    super(modelName, 'deleteRecord');
    this.id = id;
    this.setupHandler();
  }

  getType() {
    return "DELETE";
  }

}
