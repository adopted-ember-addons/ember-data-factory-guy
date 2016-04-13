import FactoryGuy from 'ember-data-factory-guy';
import { make } from 'ember-data-factory-guy';

FactoryGuy.define('employee', {
  default: {
    name: FactoryGuy.belongsTo('name'),
    titles: ['Mr.', 'Dr.'],
    gender: 'Male',
    birthDate: new Date()
  },
  traits: {
    default_name_setup: {
      name: {}
    },
    jon: {
      name: {
        firstName: 'Jon',
        lastName: 'Snow'
      }
    },
    geoffrey: {
      name: FactoryGuy.belongsTo('employee_geoffrey')
    },
    with_department_employments: {
      departmentEmployments: FactoryGuy.hasMany('department-employment', 2),
    }
  }
});
