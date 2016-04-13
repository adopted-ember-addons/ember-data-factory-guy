import attr from 'ember-data/attr';
import Fragment from 'model-fragments/fragment';

export default Fragment.extend({
  firstName : attr('string'),
  lastName  : attr('string')
});
