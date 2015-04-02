import Hat from './hat';

export default Hat.extend({
  materials: DS.hasMany('soft_material')
});
