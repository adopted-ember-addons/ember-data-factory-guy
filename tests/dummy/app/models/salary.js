import Model, { attr } from '@ember-data/model';
import { array } from 'ember-data-model-fragments/attributes';

export default class extends Model {
  @attr('number') income;
  @array('string') benefits;
}
