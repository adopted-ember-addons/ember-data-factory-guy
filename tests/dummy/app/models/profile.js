import DS from 'ember-data';

export default DS.Model.extend({
  created_at:             DS.attr('date'),
  description:            DS.attr('string'),
  camelCaseDescription:   DS.attr('string'),
  snake_case_description: DS.attr('string'),
  company:                DS.belongsTo('company'),
  group:                  DS.belongsTo('group', {polymorphic: true})
});
