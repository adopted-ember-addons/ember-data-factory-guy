import Hat from './hat';
import { hasMany } from '@ember-data/model';

export default class extends Hat {
  @hasMany('soft-material', { async: false, inverse: 'hat' }) materials;
}
