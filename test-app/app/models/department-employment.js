import { attr } from '@ember-data/model';
import Fragment from 'ember-data-model-fragments/fragment';
import { fragment } from 'ember-data-model-fragments/attributes';

export default class extends Fragment {
  @attr('date') startDate;
  @attr('date') endDate;
  @fragment('department') department;
}
