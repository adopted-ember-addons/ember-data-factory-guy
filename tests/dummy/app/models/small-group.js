import Group from './group';

export default Group.extend({
  type:    DS.attr('string', {defaultValue: 'SmallGroup'}),
  group: DS.belongsTo('group')
});
