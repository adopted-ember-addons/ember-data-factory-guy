import { attr } from '@ember-data/model';
import Fragment from 'ember-data-model-fragments/fragment';
import { fragmentArray } from 'ember-data-model-fragments/attributes';

export default class extends Fragment {
  @attr('string') name;
  @fragmentArray('nested-fragment/address', {
    polymorphic: true,
    typeKey: '$type',
  })
  addresses;
}
