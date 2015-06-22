export default DS.Model.extend({
  title:    DS.attr('string'),
  user:     DS.belongsTo('user', {async: false}),
  parent:   DS.belongsTo('project', {inverse: 'children'}),
  children: DS.hasMany('project', {inverse: 'parent'})
});
