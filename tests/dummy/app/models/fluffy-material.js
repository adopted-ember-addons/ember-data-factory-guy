import Material from './material';

export default Material.extend({
  hat:  DS.belongsTo('hat', {async: false, inverse: 'fluffyMaterials', polymorphic: true})
});
