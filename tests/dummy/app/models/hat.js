import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class extends Model {
  @attr('string') type;
  @attr('string') shape;
  @belongsTo('user', { async: false, inverse: 'hats' }) user;
  @belongsTo('outfit', { async: false, inverse: 'hats' }) outfit;
  @belongsTo('hat', { async: false, inverse: 'hats', polymorphic: true }) hat;
  @hasMany('hat', { async: false, inverse: 'hat', polymorphic: true }) hats;
  @hasMany('fluffy-material', { async: false, inverse: 'hat' }) fluffyMaterials;
}
