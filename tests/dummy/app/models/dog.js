import Model from 'ember-data/model';
import attr from 'ember-data/attr';

export default Model.extend({
  dogNumber: attr('string'),
  bark: attr('string')
});
