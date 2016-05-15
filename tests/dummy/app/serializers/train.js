import DS from 'ember-data';

// Using JSONSerializer with embedded because JSONAPI not supporting
// https://github.com/emberjs/data/issues/3720
export default DS.JSONSerializer.extend(DS.EmbeddedRecordsMixin, {
  attrs: {
    city: { embedded: 'always' },
    cars: { embedded: 'always' }
  }
});