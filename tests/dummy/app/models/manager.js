import Model from 'ember-data/model';
import { hasMany, belongsTo } from 'ember-data/relationships';
import { fragment } from 'model-fragments/attributes';

export default Model.extend({
  name      : fragment('name'),
  salary: belongsTo('salary'),
  reviews: hasMany('review')
});
