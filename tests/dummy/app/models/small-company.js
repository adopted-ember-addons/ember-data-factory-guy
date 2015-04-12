import Company from './company';

export default Company.extend({
  type:    DS.attr('string', {defaultValue: 'SmallCompany'}),
  owner: DS.belongsTo('user', {async: true}),
  projects: DS.hasMany('project')
});
