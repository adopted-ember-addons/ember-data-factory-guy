import attr from 'ember-data/attr';
import Fragment from 'ember-data-model-fragments/fragment';

export default Fragment.extend({
  seniorityLevel : attr('string'),
  specializationDomain  : attr('string')
});
