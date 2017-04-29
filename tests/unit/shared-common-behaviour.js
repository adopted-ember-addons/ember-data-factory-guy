import {moduleFor} from 'ember-qunit';
import SharedFactoryGuyBehaviour from './shared-factory-guy-behaviour';
import SharedAdapterBehaviour from './shared-adapter-behaviour';
import {inlineSetup} from '../helpers/utility-methods';

let SharedBehavior = {};

SharedBehavior.all = function(serializer, serializerType) {

  moduleFor('serializer:application', `${serializer} FactoryGuy#make`, inlineSetup(serializerType));
  SharedFactoryGuyBehaviour.makeTests();


  moduleFor('serializer:application', `${serializer} FactoryGuy#makeList`, inlineSetup(serializerType));
  SharedFactoryGuyBehaviour.makeListTests();


  moduleFor('serializer:application', `${serializer} #mockFindRecord`, inlineSetup(serializerType));
  SharedAdapterBehaviour.mockFindRecordCommonTests();


  moduleFor('serializer:application', `${serializer} #mockReload`, inlineSetup(serializerType));
  SharedAdapterBehaviour.mockReloadTests();


  moduleFor('serializer:application', `${serializer} #mockFindAll`, inlineSetup(serializerType));
  SharedAdapterBehaviour.mockFindAllCommonTests();


  moduleFor('serializer:application', `${serializer} #mockQuery`, inlineSetup(serializerType));
  SharedAdapterBehaviour.mockQueryTests();


  moduleFor('serializer:application', `${serializer} #mockQueryRecord`, inlineSetup(serializerType));
  SharedAdapterBehaviour.mockQueryRecordTests();


  moduleFor('serializer:application', `${serializer} #mockCreate`, inlineSetup(serializerType));
  SharedAdapterBehaviour.mockCreateTests();


  moduleFor('serializer:application', `${serializer} #mockUpdate`, inlineSetup(serializerType));
  SharedAdapterBehaviour.mockUpdateTests();


  moduleFor('serializer:application', `${serializer} #mockDelete`, inlineSetup(serializerType));
  SharedAdapterBehaviour.mockDeleteTests();

};

export default SharedBehavior;