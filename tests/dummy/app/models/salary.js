import DS from 'ember-data';
import { array } from 'model-fragments/attributes';

export default DS.Model.extend({
  income: DS.attr('number'),
  benefits: array('string')
});
