import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany, belongsTo } from 'ember-data/relationships';

export default Model.extend({
  type: attr('string'),
  name: attr('string'),
  style: attr('string'),
  category: attr('string'),
  company: belongsTo('company', {async: false}),
  outfits: hasMany('outfit', {async: false})
});
