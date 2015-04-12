import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  hat:  DS.belongsTo('hat', {polymorphic: true})
});
