import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class extends Model {
  @attr('string') type;
  @attr('string') shape;
  @belongsTo('user', { async: false, inverse: 'hats', as: 'hat' }) user;
  @belongsTo('outfit', { async: false, inverse: 'hats', as: 'hat' }) outfit;
  @belongsTo('hat', {
    async: false,
    inverse: 'hats',
    polymorphic: true,
    as: 'hat',
  })
  hat;
  @hasMany('hat', {
    async: false,
    inverse: 'hat',
    polymorphic: true,
    as: 'hat',
  })
  hats;
  @hasMany('fluffy-material', { async: false, inverse: 'hat', as: 'hat' })
  fluffyMaterials;
}
