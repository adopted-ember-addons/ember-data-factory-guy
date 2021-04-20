import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default Model.extend({
  title: attr('string'),
  user: belongsTo('user', { async: false }),
  manager: belongsTo('manager', { async: true }),
  parent: belongsTo('project', { async: false, inverse: 'children' }),
  children: hasMany('project', { async: false, inverse: 'parent' }),
});
