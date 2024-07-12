import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class extends Model {
  @attr('string') type;
  @attr('string') name;
  @attr('string') style;
  @attr('string') category;
  @belongsTo('company', { async: false, inverse: null }) company;
  @hasMany('outfit', { async: false, inverse: 'person' }) outfits;
}
