import Model from 'ember-data/model';
import attr from 'ember-data/attr';

export default Model.extend({
  element: attr('element', { as_symbol: true}),
});
