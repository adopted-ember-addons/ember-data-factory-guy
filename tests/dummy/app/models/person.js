import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default Model.extend({
  type: attr('string'),
  name: attr('string'),
  style: attr('string'),
  category: attr('string'),
  company: belongsTo('company', { async: false }),
  outfits: hasMany('outfit', { async: false }),
});
