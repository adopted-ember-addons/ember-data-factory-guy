import Model, { hasMany, belongsTo } from '@ember-data/model';

export default class extends Model {
  @belongsTo('salary', { async: true, inverse: null }) salary;
  @hasMany('review', { async: true, inverse: null }) reviews;
}
