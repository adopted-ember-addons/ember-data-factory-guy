import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class extends Model {
  @attr('string') title;
  @belongsTo('user', { async: false }) user;
  @belongsTo('manager', { async: true }) manager;
  @belongsTo('project', { async: false, inverse: 'children' }) parent;
  @hasMany('project', { async: false, inverse: 'parent' }) children;
}
