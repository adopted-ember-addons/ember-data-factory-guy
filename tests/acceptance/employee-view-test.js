import Ember from 'ember';
const { run } = Ember;
import { make, build, buildList, mockFind, mockCreate } from 'ember-data-factory-guy';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Employee View ( model-fragments )');
// NOTE
// FactoryGuy before and after setup is in moduleForAcceptance helper

test("Show employee by make(ing) a model and using returns with that model", function () {
  let employee = make('employee', 'with_department_employments');

  mockFind('employee').returns({model: employee});
  visit('/employee/' + employee.get('id'));

  andThen(()=>{
    ok(find('.name').text().match(`${employee.get('name.firstName')} ${employee.get('name.lastName')}`));
  });
});

test("Show employee by building(ing) json and using returns with that json", function () {
  let employee = build('employee', 'with_department_employments');

  mockFind('employee').returns({json: employee});
  visit('/employee/' + employee.get('id'));

  andThen(()=>{
    ok(find('.name').text().match(`${employee.get('name').firstName} ${employee.get('name').lastName}`));
  });
});
