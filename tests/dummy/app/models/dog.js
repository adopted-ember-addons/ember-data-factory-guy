import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

export default Model.extend({
  owner: belongsTo('person'),
  dogNumber: attr('string'),
  sound: attr('string'),
  tag: attr() // hash
});
