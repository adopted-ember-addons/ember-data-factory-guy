import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('employee', {
  default: {
    designation: FactoryGuy.belongsTo('name'),
    titles: ['Mr.', 'Dr.'],
    gender: 'Male',
    birthDate: new Date('2016-05-01')
  },
  traits: {
    default_name_setup: {
      designation: {}
    },
    jon: {
      designation: {
        firstName: 'Jon',
        lastName: 'Snow'
      }
    },
    geoffrey: {
      designation: FactoryGuy.belongsTo('employee_geoffrey')
    },
    with_department_employments: {
      departmentEmployments: FactoryGuy.hasMany('department-employment', 2)
    }
  }
});
