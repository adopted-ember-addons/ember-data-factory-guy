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


  module(title(adapter, 'FactoryGuyTestHelper#handleFind'), inlineSetup(App, adapterType));
  SharedFactoryGuyTestHelperBehavior.handleFindTests();

  module(title(adapter, 'FactoryGuyTestHelper#handleReload'), inlineSetup(App, adapterType));
  SharedFactoryGuyTestHelperBehavior.handleReloadTests();


  module(title(adapter, 'FactoryGuyTestHelper#handleFindAll'), inlineSetup(App, adapterType));
  SharedFactoryGuyTestHelperBehavior.handleFindAllTests();


  module(title(adapter, 'FactoryGuyTestHelper#handleQuery'), inlineSetup(App, adapterType));
  SharedFactoryGuyTestHelperBehavior.handleQueryTests();


  module(title(adapter, 'FactoryGuyTestHelper#handleCreate'), inlineSetup(App, adapterType));
  SharedFactoryGuyTestHelperBehavior.handleCreateTests();


  module(title(adapter, 'FactoryGuyTestHelper#handleUpdate'), inlineSetup(App, adapterType));
  SharedFactoryGuyTestHelperBehavior.handleUpdateTests();


  module(title(adapter, 'FactoryGuyTestHelper#handleDelete'), inlineSetup(App, adapterType));
  SharedFactoryGuyTestHelperBehavior.handleDeleteTests();

};

export default SharedAdapterBehavior;