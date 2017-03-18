import attr from 'ember-data/attr';
import Fragment from 'ember-data-model-fragments/fragment';

export default Fragment.extend({
  firstName : attr('string'),
  lastName  : attr('string')
});
