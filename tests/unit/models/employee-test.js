import { manualSetup, make, makeList } from 'ember-data-factory-guy';
import { test, moduleForModel } from 'ember-qunit';
import Ember from 'ember';
const { run } = Ember;

moduleForModel('employee', 'Unit | Model | employee', {
  needs: [
    'model:name',
    'model:department-employment',
    'model:department',
    'model:nested-fragment/address',
    'model:mailing-address',
    'model:billing-address',
    'transform:fragment',
    'transform:fragment-array',
    'transform:array'
  ],

  beforeEach: function() {
    manualSetup(this.container);
  }
});

// NAME FRAGMENT
test('default employee', function() {
  let employee = make('employee');
  //Should I need a run loop?
  run(() => {
    ok(employee.get('name.firstName') === 'Tyrion');
    ok(employee.get('name.lastName') === 'Lannister');
  });
});

test('employee with default name trait', function() {
  let employee = make('employee', 'default_name_setup');
  run(() => {
    ok(employee.get('name.firstName') === 'Tyrion');
    ok(employee.get('name.lastName') === 'Lannister');
  });
});

test('default employee with trait with custom name fragment', function() {
  let employee = make('employee', 'jon');
  run(() => {
    ok(employee.get('name.firstName') === 'Jon');
    ok(employee.get('name.lastName') === 'Snow');
  });
});

test('default employee with trait with custom name belongsTo', function() {
  let employee = make('employee', 'geoffrey');
  run(() => {
    ok(employee.get('name.firstName') === 'Geoffrey');
    ok(employee.get('name.lastName') === 'Lannister');
  });
});

test('manual setting up employee name', function() {
  let employee = make('employee', 'geoffrey');
  run(() => {
    ok(employee.get('name.firstName') === 'Geoffrey');
    ok(employee.get('name.lastName') === 'Lannister');
  });
});

// TITLES FRAGMENT
test('default employee and titles', function() {
  let employee = make('employee');
  run(() => {
    ok(employee.get('titles.length') === 2);
    deepEqual(employee.get('titles.content'), ['Mr.', 'Dr.']);
  });
});

// DEPARTMENT EMPLOYMENT
test('employee with department employments (fragment arrays)', function() {
  let employee = make('employee', 'with_department_employments');
  run(() => {
    ok(employee.get('departmentEmployments.length') === 2);
    let department1 = employee.get('departmentEmployments.firstObject.department');
    let department2 = employee.get('departmentEmployments').objectAt(1).get('department');
    ok(department1.get('name') === 'Acme Dept 1');
    ok(department2.get('name') === 'Acme Dept 2');

    let addresses = department1.get('addresses');
    ok(addresses.get('length') === 3);
    ok(addresses.get('firstObject.street') === '1 Sky Cell');
    ok(addresses.get('lastObject.street') === '3 Sky Cell');
  });
});
