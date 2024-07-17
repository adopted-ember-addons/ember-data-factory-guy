import Group from './group';
import { attr } from '@ember-data/model';

export default class extends Group {
  @attr('string', { defaultValue: 'small-group' }) type;
}
