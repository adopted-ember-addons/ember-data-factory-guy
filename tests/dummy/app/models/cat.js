import Model, { attr } from '@ember-data/model';

export default Model.extend({
  type: attr('string'),
  name: attr('string'),
  friend: attr('string'),
});
