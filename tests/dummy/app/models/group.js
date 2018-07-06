import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany, belongsTo } from 'ember-data/relationships';

export default Model.extend({
  type: attr('string', {defaultValue: 'Group'}),
  name: attr('string'),
  profiles: hasMany('profile', {async: false, inverse: 'group'}),
  versions: hasMany('group', {async: false, polymorphic: true, inverse: 'group'}),
  group: belongsTo('group', {async: false, polymorphic: true, inverse: 'versions'})
});
