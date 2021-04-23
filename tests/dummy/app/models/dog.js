import Model, { attr, belongsTo } from '@ember-data/model';

export default Model.extend({
  owner: belongsTo('person'),
  dogNumber: attr('string'),
  sound: attr('string'),
  tag: attr(), // hash
});
