import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import {hasMany, belongsTo} from 'ember-data/relationships';

export default Model.extend({
  title: attr('string'),
  user: belongsTo('user', { async: false }),
  parent: belongsTo('project', { async: false, inverse: 'children' }),
  children: hasMany('project', { async: false, inverse: 'parent' })
});
