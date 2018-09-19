import attr from 'ember-data/attr';
import Fragment from 'ember-data-model-fragments/fragment';
import { fragmentArray } from 'ember-data-model-fragments/attributes';

export default Fragment.extend({
  name: attr('string'),
  addresses: fragmentArray('nested-fragment/address', { polymorphic: true, typeKey: '$type' })
});
