import Model from 'ember-data/model';
import attr from 'ember-data/attr';

export default Model.extend({
  type: attr('string'),
  name: attr('string'),
  friend: attr('string')
});
