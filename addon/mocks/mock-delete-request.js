import FactoryGuy from '../factory-guy';
import MockRequest from './mock-request';
import {escapeRegExp} from '../utils/helper-functions';

export default class MockDeleteRequest extends MockRequest {
  constructor(modelName, id) {
    super(modelName);
    this.id = id;
  }

  getType() {
    return "DELETE";
  }

  /**
   If the id is null the url will not include the id, and
   can be used to match any delete for this modelName
   */
  getUrl() {
    return FactoryGuy.buildURL(this.modelName, this.id);
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
