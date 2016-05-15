import SharedFactoryGuyBehavior from './shared-factory-guy-tests';
import SharedFactoryGuyTestHelperBehavior from './shared-factory-guy-test-helper-tests';
import { title, inlineSetup } from '../helpers/utility-methods';

let SharedAdapterBehavior = {};

SharedAdapterBehavior.all = function (adapter, serializerType) {
  let App = null;

  module(title(adapter, 'FactoryGuy#make'), inlineSetup(App, serializerType));
  SharedFactoryGuyBehavior.makeTests();


  module(title(adapter, 'FactoryGuy#makeList'), inlineSetup(App, serializerType));
  SharedFactoryGuyBehavior.makeListTests();


  module(title(adapter, 'FactoryGuy#buildUrl'), inlineSetup(App, serializerType));
  SharedFactoryGuyTestHelperBehavior.buildUrl();


  module(title(adapter, 'FactoryGuyTestHelper#mockFind'), inlineSetup(App, serializerType));
  SharedFactoryGuyTestHelperBehavior.mockFindCommonTests();


  module(title(adapter, 'FactoryGuyTestHelper#mockReload'), inlineSetup(App, serializerType));
  SharedFactoryGuyTestHelperBehavior.mockReloadTests();


  module(title(adapter, 'FactoryGuyTestHelper#mockFindAll'), inlineSetup(App, serializerType));
  SharedFactoryGuyTestHelperBehavior.mockFindAllCommonTests();


  module(title(adapter, 'FactoryGuyTestHelper#mockQuery'), inlineSetup(App, serializerType));
  SharedFactoryGuyTestHelperBehavior.mockQueryTests();


  module(title(adapter, 'FactoryGuyTestHelper#mockQueryRecord'), inlineSetup(App, serializerType));
  SharedFactoryGuyTestHelperBehavior.mockQueryRecordTests();


  module(title(adapter, 'FactoryGuyTestHelper#mockCreate'), inlineSetup(App, serializerType));
  SharedFactoryGuyTestHelperBehavior.mockCreateTests();


  module(title(adapter, 'FactoryGuyTestHelper#mockUpdate'), inlineSetup(App, serializerType));
  SharedFactoryGuyTestHelperBehavior.mockUpdateTests();


  module(title(adapter, 'FactoryGuyTestHelper#mockDelete'), inlineSetup(App, serializerType));
  SharedFactoryGuyTestHelperBehavior.mockDeleteTests();

};

export default SharedAdapterBehavior;