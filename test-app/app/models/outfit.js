import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class extends Model {
  @attr('string') name;
  @belongsTo('person', { async: false, polymorphic: true, inverse: 'outfits' })
  person;
  @hasMany('hat', { async: false, polymorphic: true, inverse: 'outfit' }) hats;
}
