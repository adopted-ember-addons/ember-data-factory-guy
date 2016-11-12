import MockRequest from './mock-request';
import MaybeIdUrlMatch from './maybe-id-url-match';

export default class MockDeleteRequest extends MaybeIdUrlMatch(MockRequest) {
  constructor(modelName, id) {
    super(modelName, 'deleteRecord');
    this.id = id;
  }

  getType() {
    return "DELETE";
  }

}
