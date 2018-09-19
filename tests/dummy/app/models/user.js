import { computed } from '@ember/object';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany, belongsTo } from 'ember-data/relationships';

export default Model.extend({
  name: attr('string'),
  style: attr(), // purposely leave this blank just for making sure these attr types work
  info: attr('object'),
  company: belongsTo('company', { async: true, inverse: 'users', polymorphic: true }),
  properties: hasMany('property', { async: true, inverse: 'owners' }),
  projects: hasMany('project', { async: false }),
  hats: hasMany('hat', { async: false, polymorphic: true }),

  funnyName: computed("name", function() {
    return "funny " + this.get('name');
  })
});
