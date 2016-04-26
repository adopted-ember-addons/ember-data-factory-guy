import Ember from 'ember';
const { run } = Ember;
import { make, build, buildList, mockFind, mockCreate } from 'ember-data-factory-guy';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Employee View');
// NOTE
// FactoryGuy before and after setup is in moduleForAcceptance helper

test("Show employee by make(ing) a model and using returns with that model", function () {
  // make a user with projects ( which will be in the store )
  // if you need the computed properties on the model this is best bet
  let name;
  let departmentEmployments;
  let employee = make('employee', 'with_department_employments');
  run(() => {
    name = employee.get('name');
    departmentEmployments = employee.get('departmentEmployments');
  });

  mockFind('employee').returns({model: employee});

  visit('/employee/' + employee.get('id'));

  andThen(()=>{
    ok(find('.name').text().match(`${employee.get('name.firstName')} ${employee.get('name.lastName')}`));
  });
});
