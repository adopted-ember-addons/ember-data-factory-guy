import Model, { attr, belongsTo } from '@ember-data/model';

export default class extends Model {
  @belongsTo('person') owner;
  @attr('string') dogNumber;
  @attr('string') sound;
  @attr() tag; // hash
}
