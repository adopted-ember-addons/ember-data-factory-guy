import DS from 'ember-data';

// Using RESTSerializer for now with embedded because JSONAPI not supporting
// https://github.com/emberjs/data/issues/3720
export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, {
  attrs: {
    company: { embedded: 'always' },
    characters: { embedded: 'always' }
  }
});