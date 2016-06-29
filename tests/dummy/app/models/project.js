export default DS.Model.extend({
  title:    DS.attr('string'),
  user:     DS.belongsTo('user', {async: false}),
  parent:   DS.belongsTo('project', {async: false, inverse: 'children'}),
  children: DS.hasMany('project', {async: false, inverse: 'parent'})
});
