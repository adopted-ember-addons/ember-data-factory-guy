import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default Model.extend({
  type: attr('string', { defaultValue: 'Group' }),
  name: attr('string'),
  profiles: hasMany('profile', { async: false, inverse: 'group' }),
  versions: hasMany('group', {
    async: false,
    polymorphic: true,
    inverse: 'group',
  }),
  group: belongsTo('group', {
    async: false,
    polymorphic: true,
    inverse: 'versions',
  }),
});
