import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default Model.extend({
  name: attr('string'),
  person: belongsTo('person', { async: false, polymorphic: true }),
  hats: hasMany('hat', { async: false, polymorphic: true }),
});
