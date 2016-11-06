import FactoryGuy from '../factory-guy';
import MockRequest from './mock-request';
import {escapeRegExp} from '../utils/helper-functions';

export default class MockDeleteRequest extends MockRequest {
  constructor(modelName, id) {
    super(modelName, 'deleteRecord');
    this.id = id;
  }

  getType() {
    return "DELETE";
  }

  urlMatch(settings) {
    /**
     If no id is specified, match any url with an id,
     with or without a trailing slash after the id.
     Ex: /profiles/:id and /profiles/:id/
     */
    let url = escapeRegExp(this.getUrl());
    if (!this.id) {
      url = new RegExp(url + '\/*\\d+\/*');
    }

    return settings.url.match(url);
  }

}
