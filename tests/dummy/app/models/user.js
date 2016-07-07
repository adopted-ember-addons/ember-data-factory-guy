import Ember from 'ember';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import {hasMany, belongsTo} from 'ember-data/relationships';

export default Model.extend({
  name: attr('string'),
  style: attr('string'),
  info: attr('object'),
  company: belongsTo('company', { async: true, inverse: 'users', polymorphic: true }),
  properties: hasMany('property', { async: true, inverse: 'owners' }),
  projects: hasMany('project', { async: false }),
  hats: hasMany('hat', { async: false, polymorphic: true }),

  funnyName: Ember.computed("name", function() {
    return "funny " + this.get('name');
  })
});
