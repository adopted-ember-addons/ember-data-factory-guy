import Material from './material';
import { belongsTo } from '@ember-data/model';

export default Material.extend({
  hat: belongsTo('hat', {
    async: false,
    inverse: 'fluffyMaterials',
    polymorphic: true,
  }),
});
