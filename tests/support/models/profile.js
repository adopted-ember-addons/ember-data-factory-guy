Profile = DS.Model.extend({
  description:  DS.attr('string'),
  company:      DS.belongsTo('company')
});
