import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default Model.extend({
  type: attr('string', { defaultValue: 'Company' }),
  name: attr('string'),
  profile: belongsTo('profile', { async: false }),
  users: hasMany('user', { async: true, inverse: 'company' }),
  projects: hasMany('project', { async: true }),
});
