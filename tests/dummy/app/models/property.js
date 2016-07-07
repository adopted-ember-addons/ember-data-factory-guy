import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import {hasMany, belongsTo} from 'ember-data/relationships';

export default Model.extend({
  name: attr('string'),
  company: belongsTo('company', { async: true }),
  owners: hasMany('user', { async: true, inverse: 'properties' })
});
