import Model, { hasMany, belongsTo } from '@ember-data/model';
import { fragment } from 'ember-data-model-fragments/attributes';

export default Model.extend({
  name: fragment('name'),
  salary: belongsTo('salary'),
  reviews: hasMany('review'),
});
