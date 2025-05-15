import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class extends Model {
  @attr('string') name;
  @attr() style; // purposely leave this blank just for making sure these attr types work
  @attr('object') info;
  @belongsTo('company', {
    async: true,
    inverse: 'users',
    polymorphic: true,
  })
  company;
  @hasMany('property', { async: true, inverse: 'owners' }) properties;
  @hasMany('project', { async: false, inverse: 'user' }) projects;
  @hasMany('hat', { async: false, polymorphic: true, inverse: 'user' })
  hats;

  get funnyName() {
    return 'funny ' + this.name;
  }
}
