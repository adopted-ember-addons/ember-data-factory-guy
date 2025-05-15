import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class extends Model {
  @attr('string', { defaultValue: 'Group' }) type;
  @attr('string') name;
  @hasMany('profile', { as: 'group', async: false, inverse: 'group' }) profiles;
  @hasMany('group', {
    async: false,
    polymorphic: true,
    inverse: 'group',
  })
  versions;
  @belongsTo('group', {
    as: 'group',
    async: false,
    polymorphic: true,
    inverse: 'versions',
  })
  group;
}
