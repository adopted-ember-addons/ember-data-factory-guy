import Company from './company';
import { attr, hasMany, belongsTo } from '@ember-data/model';

export default Company.extend({
  type: attr('string', { defaultValue: 'SmallCompany' }),
  owner: belongsTo('user', { async: true }),
  projects: hasMany('project', { async: false }),
});
