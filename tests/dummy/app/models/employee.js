import Model, { attr } from '@ember-data/model';

export default class extends Model {
  @attr('string') gender;
  @attr('date') birthDate;
  @attr() position;
}
