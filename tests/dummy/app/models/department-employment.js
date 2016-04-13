import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import Fragment from 'model-fragments/fragment';
import {
  fragment
} from 'model-fragments/attributes';

export default Fragment.extend({
  startDate: attr('date'),
  endDate: attr('date'),
  department: fragment('department')
});
