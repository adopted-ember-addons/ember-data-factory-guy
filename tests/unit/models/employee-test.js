import {manualSetup, make, makeList, build, buildList} from 'ember-data-factory-guy';
import {test, moduleForModel} from 'ember-qunit';
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
    ok(employee.get('designation.firstName') === 'Tyrion');
    ok(employee.get('designation.lastName') === 'Lannister');
  });
});

test('employee with default name trait', function() {
  let employee = make('employee', 'default_name_setup');
  run(() => {
    ok(employee.get('designation.firstName') === 'Tyrion');
    ok(employee.get('designation.lastName') === 'Lannister');
  });
});

test('default employee with trait with custom name fragment', function() {
  let employee = make('employee', 'jon');
  run(() => {
    ok(employee.get('designation.firstName') === 'Jon');
    ok(employee.get('designation.lastName') === 'Snow');
  });
});

test('default employee with trait with custom name belongsTo', function() {
  let employee = make('employee', 'geoffrey');
  run(() => {
    ok(employee.get('designation.firstName') === 'Geoffrey');
    ok(employee.get('designation.lastName') === 'Lannister');
  });
});

test('manual setting up employee name', function() {
  let employee = make('employee', 'geoffrey');
  run(() => {
    ok(employee.get('designation.firstName') === 'Geoffrey');
    ok(employee.get('designation.lastName') === 'Lannister');
  });
});

test('employee belongsTo designation (fragments) setup manually', function() {
  run(() => {
    let employee = make('employee', {
      designation: build('name').get()
    });

    equal(employee.get('designation.firstName'), 'Tyrion');
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

test('employee hasMany departmentEmployments setup manually', function() {
  run(() => {
    let departmentEmployments = buildList('department-employment', 2).get();
    let employee = make('employee', { departmentEmployments });
    equal(employee.get('departmentEmployments.length'), 2);
  });
});

test('employee hasMany department employments (fragment arrays) setup in fixture', function() {
  let employee = make('employee', 'with_department_employments');
  run(() => {
    equal(employee.get('departmentEmployments.length'), 2);
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
