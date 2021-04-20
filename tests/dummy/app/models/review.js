import Model, { attr } from '@ember-data/model';

export default Model.extend({
  rating: attr('number'),
  date: attr('date'),
});
