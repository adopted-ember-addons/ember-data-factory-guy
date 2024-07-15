import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class extends Model {
  @attr('string', { defaultValue: 'Group' }) type;
  @attr('string') name;
  @hasMany('profile', { async: false, inverse: 'group', as: 'group' }) profiles;
  @hasMany('group', {
    async: false,
    polymorphic: true,
    inverse: 'group',
    as: 'group',
  })
  versions;
  @belongsTo('group', {
    async: false,
    polymorphic: true,
    inverse: 'versions',
    as: 'group',
  })
  group;
}
