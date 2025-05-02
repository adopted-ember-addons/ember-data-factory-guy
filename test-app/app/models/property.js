import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class extends Model {
  @attr('string') name;
  @belongsTo('company', { async: true }) company;
  @hasMany('user', { async: true, inverse: 'properties' }) owners;
}
