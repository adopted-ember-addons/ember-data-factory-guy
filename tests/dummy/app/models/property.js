import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default Model.extend({
  name: attr('string'),
  company: belongsTo('company', { async: true }),
  owners: hasMany('user', { async: true, inverse: 'properties' }),
});
