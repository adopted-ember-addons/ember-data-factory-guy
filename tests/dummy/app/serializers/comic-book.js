import DS from 'ember-data';

// Only testing RESTSerializer for now with embedded because not sure if
// JSONAPI users are using this?
export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin,{
  attrs: {
    company: {embedded: 'always'},
    characters: {embedded: 'always'}
  }
});