import Model, { attr } from '@ember-data/model';

export default class extends Model {
  @attr('element', { as_symbol: true }) element;
}
