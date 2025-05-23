import Hat from './hat';
import { hasMany } from '@ember-data/model';

export default class extends Hat {
  @hasMany('material', { async: true, polymorphic: true, inverse: null })
  materials;
}
