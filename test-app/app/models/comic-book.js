import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class extends Model {
  @attr('string') name;
  @belongsTo('company') company;
  @hasMany('person', { polymorphic: true }) characters;
  @hasMany('villain') includedVillains;
}
