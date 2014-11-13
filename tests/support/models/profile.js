Profile = DS.Model.extend({
  description:            DS.attr('string'),
  camelCaseDescription:   DS.attr('string'),
  snake_case_description: DS.attr('string'),
  company:                DS.belongsTo('company'),
  group:                  DS.belongsTo('group', {polymorphic: true})
});
