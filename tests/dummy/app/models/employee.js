import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import {array, fragment, fragmentArray} from 'ember-data-model-fragments/attributes';

export default Model.extend({
  designation: fragment('name'),
  name: fragment('name'),
  titles: array('string'),
  gender: attr('string'),
  birthDate: attr('date'),
  position: attr(),
  departmentEmployments: fragmentArray('department-employment'),
  role: fragment('role'),
});
