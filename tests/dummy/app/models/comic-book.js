import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class extends Model {
  @attr('string') name;
  @belongsTo('company', { async: true, inverse: null }) company;
  @hasMany('person', {
    polymorphic: true,
    async: true,
    inverse: null,
  })
  characters;
  @hasMany('villain', { async: true, inverse: null }) includedVillains;
}
