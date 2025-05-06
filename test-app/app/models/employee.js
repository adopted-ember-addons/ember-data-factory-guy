import Model, { attr } from '@ember-data/model';
import {
  array,
  fragment,
  fragmentArray,
} from 'ember-data-model-fragments/attributes';

export default class extends Model {
  @fragment('name') designation;
  @fragment('name') name;
  @array('string') titles;
  @attr('string') gender;
  @attr('date') birthDate;
  @attr() position;
  @fragmentArray('department-employment') departmentEmployments;
}
