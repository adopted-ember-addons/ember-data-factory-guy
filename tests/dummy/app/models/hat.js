import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default Model.extend({
  type: attr('string'),
  shape: attr('string'),
  user: belongsTo('user', { async: false, inverse: 'hats' }),
  outfit: belongsTo('outfit', { async: false, inverse: 'hats' }),
  hat: belongsTo('hat', { async: false, inverse: 'hats', polymorphic: true }),
  hats: hasMany('hat', { async: false, inverse: 'hat', polymorphic: true }),
  fluffyMaterials: hasMany('fluffy-material', { async: false, inverse: 'hat' }),
});
