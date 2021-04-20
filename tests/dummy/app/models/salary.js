import Model, { attr } from '@ember-data/model';
import { array } from 'ember-data-model-fragments/attributes';

export default Model.extend({
  income: attr('number'),
  benefits: array('string'),
});
