import Model, { attr } from '@ember-data/model';

export default class extends Model {
  @attr('number') rating;
  @attr('date') date;
}
