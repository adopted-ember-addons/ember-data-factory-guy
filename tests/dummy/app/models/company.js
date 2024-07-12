import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class extends Model {
  @attr('string', { defaultValue: 'Company' }) type;
  @attr('string') name;
  @belongsTo('profile', { async: false, inverse: 'company' }) profile;
  @hasMany('user', { async: true, inverse: 'company' }) users;
  @hasMany('project', { async: true, inverse: null }) projects;
}
