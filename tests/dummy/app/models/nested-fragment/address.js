import attr from 'ember-data/attr';
import Fragment from 'ember-data-model-fragments/fragment';

export default Fragment.extend({
  street  : attr('string'),
  city    : attr('string'),
  region  : attr('string'),
  country : attr('string')
});
