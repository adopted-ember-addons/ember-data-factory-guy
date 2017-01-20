import {manualSetup, build, make, makeList, buildList} from 'ember-data-factory-guy';
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
test('default employee', function(assert) {
  let employee = make('employee');

  //Should I need a run loop?
  run(() => {
    assert.ok(employee.get('name.firstName') === 'Tyrion');
    assert.ok(employee.get('name.lastName') === 'Lannister');
  });
});

// FRAGMENT attribute this differently named than fragment type
// passing in a value you built manually
test('making employee with attribute this differently named than fragment type', function(assert) {
  let employee = make('employee', {designation: build('name').get()});
  //Should I need a run loop?
  run(() => {
    assert.ok(employee.get('designation.firstName') === 'Tyrion');
    assert.ok(employee.get('designation.lastName') === 'Lannister');
  });
});

/** FRAGMENT attribute this differently named than fragment type
 letting factory guy make the type for you from definition like:
 traits: {
   with_designation:{
    designation: {}
   },
 }
*/
test('making employee with attribute this differently named than fragment type with empty declaration in definition', function(assert) {
  let employee = make('employee', 'with_designation');
  //Should I need a run loop?
  run(() => {
    assert.ok(employee.get('designation.firstName') === 'Tyrion');
    assert.ok(employee.get('designation.lastName') === 'Lannister');
  });
});

test('employee with default name trait', function(assert) {
  let employee = make('employee', 'default_name_setup');
  run(() => {
    assert.ok(employee.get('name.firstName') === 'Tyrion');
    assert.ok(employee.get('name.lastName') === 'Lannister');
  });
});

test('default employee with trait with custom name fragment', function(assert) {
  let employee = make('employee', 'jon');
  run(() => {
    assert.ok(employee.get('name.firstName') === 'Jon');
    assert.ok(employee.get('name.lastName') === 'Snow');
  });
});

test('default employee with trait with custom name belongsTo', function(assert) {
  let employee = make('employee', 'geoffrey');
  run(() => {
    assert.ok(employee.get('name.firstName') === 'Geoffrey');
    assert.ok(employee.get('name.lastName') === 'Lannister');
  });
});

test('manual setting up employee name', function(assert) {
  let employee = make('employee', 'geoffrey');
  run(() => {
    assert.ok(employee.get('name.firstName') === 'Geoffrey');
    assert.ok(employee.get('name.lastName') === 'Lannister');
  });
});

// TITLES FRAGMENT
test('default employee and titles', function(assert) {
  let employee = make('employee');
  run(() => {
    assert.ok(employee.get('titles.length') === 2);
    assert.deepEqual(employee.get('titles.content'), ['Mr.', 'Dr.']);
  });
});

// DEPARTMENT EMPLOYMENT

test('employee hasMany departmentEmployments setup manually', function(assert) {
  run(() => {
    let departmentEmployments = buildList('department-employment', 2).get();
    let employee = make('employee', { departmentEmployments });
    assert.equal(employee.get('departmentEmployments.length'), 2);
  });
});

test('employee hasMany department employments (fragment arrays) setup in fixture', function(assert) {
  let employee = make('employee', 'with_department_employments');
  run(() => {
    assert.equal(employee.get('departmentEmployments.length'), 2);
    let department1 = employee.get('departmentEmployments.firstObject.department');
    let department2 = employee.get('departmentEmployments').objectAt(1).get('department');
    assert.ok(department1.get('name') === 'Acme Dept 1');
    assert.ok(department2.get('name') === 'Acme Dept 2');

    let addresses = department1.get('addresses');
    assert.ok(addresses.get('length') === 3);
    assert.ok(addresses.get('firstObject.street') === '1 Sky Cell');
    assert.ok(addresses.get('lastObject.street') === '3 Sky Cell');
  });
});
