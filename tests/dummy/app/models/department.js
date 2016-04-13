import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import Fragment from 'model-fragments/fragment';
import {
  fragmentArray
} from 'model-fragments/attributes';

export default Fragment.extend({
  name: attr('string'),
  addresses: fragmentArray('nested-fragment/address', { polymorphic: true, typeKey: '$type' })
});
