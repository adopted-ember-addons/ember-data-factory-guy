import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class extends Model {
  @attr('string') type;
  @attr('string') name;
  @attr('string') style;
  @attr('string') category;
  @belongsTo('company', { async: false }) company;
  @hasMany('outfit', { async: false }) outfits;
}
