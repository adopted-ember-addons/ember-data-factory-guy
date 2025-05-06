import Material from './material';
import { belongsTo } from '@ember-data/model';

export default class extends Material {
  @belongsTo('hat', {
    async: false,
    inverse: 'fluffyMaterials',
    polymorphic: true,
  })
  hat;
}
