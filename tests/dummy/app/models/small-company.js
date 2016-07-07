import Company from './company';
import attr from 'ember-data/attr';
import {hasMany, belongsTo} from 'ember-data/relationships';

export default Company.extend({
  type: attr('string', { defaultValue: 'SmallCompany' }),
  owner: belongsTo('user', { async: true }),
  projects: hasMany('project', { async: false })
});
