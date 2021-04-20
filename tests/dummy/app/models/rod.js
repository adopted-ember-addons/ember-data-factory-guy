import Model, { attr } from '@ember-data/model';

export default Model.extend({
  element: attr('element', { as_symbol: true }),
});
