import Material from './material';
import { belongsTo } from '@ember-data/model';

export default class extends Material {
  @belongsTo('big-hat', { async: false }) hat;
}
