import DS from 'ember-data';

export default DS.JSONAPIAdapter.extend({
  buildURL(modelName, id, snapshot, requestType, query)  {
    const url = this._super(modelName, id, snapshot, requestType, query);
    const delimiter = (url.indexOf('?') !== -1) ? '&' : '?';
    return `${url}${delimiter}company_id=12345`;
  }
});

