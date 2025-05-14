import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class extends Model {
  @attr('string') title;
  @belongsTo('user', { async: false, inverse: 'projects' }) user;
  @belongsTo('manager', { async: true, inverse: null }) manager;
  @belongsTo('project', { async: false, inverse: 'children' }) parent;
  @hasMany('project', { async: false, inverse: 'parent' }) children;
}
