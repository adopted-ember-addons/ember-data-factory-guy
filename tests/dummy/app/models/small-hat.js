import Hat from './hat';

export default Hat.extend({
  materials: DS.hasMany('material', {polymorphic: true})
});
