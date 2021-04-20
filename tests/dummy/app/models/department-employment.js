import { attr } from '@ember-data/model';
import Fragment from 'ember-data-model-fragments/fragment';
import { fragment } from 'ember-data-model-fragments/attributes';

export default Fragment.extend({
  startDate: attr('date'),
  endDate: attr('date'),
  department: fragment('department'),
});
