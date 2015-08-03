import DS from 'ember-data';

export default DS.Model.extend({
  created_at:             DS.attr('date'),
  description:            DS.attr('string'),
  camelCaseDescription:   DS.attr('string'),
  snake_case_description: DS.attr('string'),
  superHero:              DS.belongsTo('super-hero', {async: false}),
  company:                DS.belongsTo('company', {async: false}),
  group:                  DS.belongsTo('group', {async: false, polymorphic: true})
});
