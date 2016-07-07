import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import {hasMany, belongsTo} from 'ember-data/relationships';

export default Model.extend({
  name: attr('string'),
  person: belongsTo('person', {async: false, polymorphic: true}), 
  hats: hasMany('hat', {async: false, polymorphic: true})
});
