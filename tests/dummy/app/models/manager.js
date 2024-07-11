import Model, { hasMany, belongsTo } from '@ember-data/model';

export default class extends Model {
  @belongsTo('salary') salary;
  @hasMany('review') reviews;
}
