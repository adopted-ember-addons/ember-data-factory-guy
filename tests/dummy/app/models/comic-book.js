import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default Model.extend({
  name: attr('string'),
  company: belongsTo('company'),
  characters: hasMany('person', { polymorphic: true }),
  includedVillains: hasMany('villain'),
});
