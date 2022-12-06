import { attr } from '@ember-data/model';
import Fragment from 'ember-data-model-fragments/fragment';

export default class extends Fragment {
  @attr('string') street;
  @attr('string') city;
  @attr('string') region;
  @attr('string') country;
}
