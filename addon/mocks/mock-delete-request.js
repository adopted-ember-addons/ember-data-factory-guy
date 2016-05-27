import FactoryGuy from '../factory-guy';
import MockRequest from './mock-request';

export default class MockDeleteRequest extends MockRequest {
  constructor(modelName, id) {
    super(modelName);
    this.id = id;
  }

  getType() {
    return "DELETE";
  }

  getUrl() {
    if(this.id) {
      return FactoryGuy.buildURL(this.modelName, this.id);
    } else {
      return FactoryGuy.buildURL(this.modelName, null);
    }
  }

  basicRequestMatches(settings) {
    let url = this.getUrl();

    /**
     If no id is specified, match any url with an id,
     with or without a trailing slash after the id.
     Ex: /profiles/:id and /profiles/:id/
     */
    if(!this.id) {
      url = new RegExp(url + '\/*\\d+\/*');
    }

    return settings.url.match(url) && settings.type === this.getType();
  }
}
