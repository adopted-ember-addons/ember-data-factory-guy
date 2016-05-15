import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  city: DS.belongsTo('city'),
  cars: DS.hasMany('car'),
});