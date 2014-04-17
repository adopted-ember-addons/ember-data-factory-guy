Project = DS.Model.extend({
  title: DS.attr('string'),
  user: DS.belongsTo('user')
})
