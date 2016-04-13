import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import {
  array,
  fragment,
  fragmentArray
} from 'model-fragments/attributes';

export default Model.extend({
  name      : fragment('name'),
  titles    : array('string'),
  gender    : attr('string'),
  birthDate: attr('date'),
  departmentEmployments : fragmentArray('department-employment')
});
