import SharedFactoryGuyBehavior from './shared-factory-guy-tests';
import {moduleFor} from 'ember-qunit';
import SharedFactoryGuyTestHelperBehavior from './shared-factory-guy-test-helper-tests';
import {inlineSetup} from '../helpers/utility-methods';

let SharedAdapterBehavior = {};

SharedAdapterBehavior.all = function(serializer, serializerType) {

  moduleFor('serializer:application', `${serializer} FactoryGuy#make`, inlineSetup(serializerType));
  SharedFactoryGuyBehavior.makeTests();


  moduleFor('serializer:application', `${serializer} FactoryGuy#makeList`, inlineSetup(serializerType));
  SharedFactoryGuyBehavior.makeListTests();


  moduleFor('serializer:application', `${serializer} #mockFindRecord`, inlineSetup(serializerType));
  SharedFactoryGuyTestHelperBehavior.mockFindRecordCommonTests();


  moduleFor('serializer:application', `${serializer} #mockReload`, inlineSetup(serializerType));
  SharedFactoryGuyTestHelperBehavior.mockReloadTests();


  moduleFor('serializer:application', `${serializer} #mockFindAll`, inlineSetup(serializerType));
  SharedFactoryGuyTestHelperBehavior.mockFindAllCommonTests();


  moduleFor('serializer:application', `${serializer} #mockQuery`, inlineSetup(serializerType));
  SharedFactoryGuyTestHelperBehavior.mockQueryTests();


  moduleFor('serializer:application', `${serializer} #mockQueryRecord`, inlineSetup(serializerType));
  SharedFactoryGuyTestHelperBehavior.mockQueryRecordTests();


  moduleFor('serializer:application', `${serializer} #mockCreate`, inlineSetup(serializerType));
  SharedFactoryGuyTestHelperBehavior.mockCreateTests();


  moduleFor('serializer:application', `${serializer} #mockUpdate`, inlineSetup(serializerType));
  SharedFactoryGuyTestHelperBehavior.mockUpdateTests();


  moduleFor('serializer:application', `${serializer} #mockDelete`, inlineSetup(serializerType));
  SharedFactoryGuyTestHelperBehavior.mockDeleteTests();

};

export default SharedAdapterBehavior;