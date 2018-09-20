import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { array } from 'ember-data-model-fragments/attributes';

export default Model.extend({
  income: attr('number'),
  benefits: array('string')
});
