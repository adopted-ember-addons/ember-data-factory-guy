import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import {hasMany, belongsTo} from 'ember-data/relationships';
import {array, fragment, fragmentArray} from 'model-fragments/attributes';

export default Model.extend({
  designation: fragment('name'),
  titles: array('string'),
  gender: attr('string'),
  birthDate: attr('date'),
  position: attr(),
  employments: fragmentArray('department-employment')
});
