/**
 This is a mixin used by Mocks that might match on id or not depending if id exists

 @param superclass
 @constructor
 */
const MaybeIdUrlMatch = (superclass) =>
  class extends superclass {
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
  };

export default MaybeIdUrlMatch;
