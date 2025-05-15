import Company from './company';
import { attr, hasMany, belongsTo } from '@ember-data/model';

export default class extends Company {
  @attr('string', { defaultValue: 'SmallCompany' }) type;
  @belongsTo('user', { async: true, inverse: null }) owner;
  @hasMany('project', { async: false, inverse: null }) projects;
}
