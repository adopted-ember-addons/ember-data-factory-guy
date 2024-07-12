import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class extends Model {
  @attr('string', { defaultValue: 'Company' }) type;
  @attr('string') name;
  @belongsTo('profile', { async: false }) profile;
  @hasMany('user', { async: true, inverse: 'company' }) users;
  @hasMany('project', { async: true, inverse: null }) projects;
}
