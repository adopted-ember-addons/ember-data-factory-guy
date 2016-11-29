import DS from 'ember-data';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, {
  attrs: {
    salary: {
      serialize: true,
      deserialize: 'records'
    },
    reviews: {
      serialize: true,
      deserialize: 'records'
    }
  },

  keyForAttribute(attr, method) {
    return this._super(...arguments);
  }
  
});
