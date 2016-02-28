import SharedFactoryGuyBehavior from './shared-factory-guy-tests';
import SharedFactoryGuyTestHelperBehavior from './shared-factory-guy-test-helper-tests';
import { title, inlineSetup } from '../helpers/utility-methods';

let SharedAdapterBehavior = {};

SharedAdapterBehavior.all = function (adapter, adapterType) {
  let App = null;

  module(title(adapter, 'FactoryGuy#make'), inlineSetup(App, adapterType));
  SharedFactoryGuyBehavior.makeTests();


  module(title(adapter, 'FactoryGuy#makeList'), inlineSetup(App, adapterType));
  SharedFactoryGuyBehavior.makeListTests();


  module(title(adapter, 'FactoryGuyTestHelper#buildUrl'), inlineSetup(App, adapterType));
  SharedFactoryGuyTestHelperBehavior.buildUrl();


  module(title(adapter, 'FactoryGuyTestHelper#mockFind'), inlineSetup(App, adapterType));
  SharedFactoryGuyTestHelperBehavior.handleFindTests();

  module(title(adapter, 'FactoryGuyTestHelper#mockReload'), inlineSetup(App, adapterType));
  SharedFactoryGuyTestHelperBehavior.handleReloadTests();


  module(title(adapter, 'FactoryGuyTestHelper#mockFindAll'), inlineSetup(App, adapterType));
  SharedFactoryGuyTestHelperBehavior.handleFindAllTests();


  module(title(adapter, 'FactoryGuyTestHelper#mockQuery'), inlineSetup(App, adapterType));
  SharedFactoryGuyTestHelperBehavior.handleQueryTests();

  module(title(adapter, 'FactoryGuyTestHelper#mockQueryRecord'), inlineSetup(App, adapterType));
  SharedFactoryGuyTestHelperBehavior.handleQueryRecordTests();

  module(title(adapter, 'FactoryGuyTestHelper#mockCreate'), inlineSetup(App, adapterType));
  SharedFactoryGuyTestHelperBehavior.handleCreateTests();


  module(title(adapter, 'FactoryGuyTestHelper#mockUpdate'), inlineSetup(App, adapterType));
  SharedFactoryGuyTestHelperBehavior.handleUpdateTests();


  module(title(adapter, 'FactoryGuyTestHelper#mockDelete'), inlineSetup(App, adapterType));
  SharedFactoryGuyTestHelperBehavior.handleDeleteTests();

};

export default SharedAdapterBehavior;