import RESTSerializer, {
  EmbeddedRecordsMixin,
} from '@ember-data/serializer/rest';

export default RESTSerializer.extend(EmbeddedRecordsMixin, {
  attrs: {
    salary: {
      serialize: true,
      deserialize: 'records',
    },
    reviews: {
      serialize: true,
      deserialize: 'records',
    },
  },

  keyForAttribute() {
    return this._super(...arguments);
  },
});
