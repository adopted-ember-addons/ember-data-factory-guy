import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  primaryKey: '_id',
});
