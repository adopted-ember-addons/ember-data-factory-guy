import attr from 'ember-data/attr';
import Fragment from 'model-fragments/fragment';

export default Fragment.extend({
  street  : attr('string'),
  city    : attr('string'),
  region  : attr('string'),
  country : attr('string')
});
