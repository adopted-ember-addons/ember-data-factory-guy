import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  hats: DS.hasMany('hat', {polymorphic: true
  })
});
