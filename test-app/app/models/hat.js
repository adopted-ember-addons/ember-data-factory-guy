import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class extends Model {
  @attr('string') type;
  @attr('string') shape;
  @belongsTo('user', { as: 'hat', async: false, inverse: 'hats' }) user;
  @belongsTo('outfit', { as: 'hat', async: false, inverse: 'hats' }) outfit;
  @belongsTo('hat', {
    as: 'hat',
    async: false,
    inverse: 'hats',
    polymorphic: true,
  })
  hat;
  @hasMany('hat', {
    as: 'hat',
    async: false,
    inverse: 'hat',
    polymorphic: true,
  })
  hats;
  @hasMany('fluffy-material', { as: 'hat', async: false, inverse: 'hat' })
  fluffyMaterials;
}
