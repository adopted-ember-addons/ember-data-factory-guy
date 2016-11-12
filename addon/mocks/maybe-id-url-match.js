import {escapeRegExp} from '../utils/helper-functions';

/**
 This is a mixin used by Mocks that might match on id or not depending if id exists

 @param superclass
 @constructor
 */
const MaybeIdUrlMatch = (superclass) => class extends superclass {

  /**
   Used by getUrl to => this.get('id')

   For mockDelete: If the id is null, the url will not include the id, and
   can therefore be used to match any delete for this modelName
   */
  get(...args) {
    if (args[0] === 'id') {
      return this.id;
    }
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
};

export default MaybeIdUrlMatch;