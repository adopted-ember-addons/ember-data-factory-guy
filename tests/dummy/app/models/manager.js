import Model, { hasMany, belongsTo } from '@ember-data/model';
import { fragment } from 'ember-data-model-fragments/attributes';

export default class extends Model {
  @fragment('name') name;
  @belongsTo('salary') salary;
  @hasMany('review') reviews;
}
