import Model, { attr } from '@ember-data/model';

export default class extends Model {
  @attr('string') type;
  @attr('string') name;
  @attr('string') friend;
}
