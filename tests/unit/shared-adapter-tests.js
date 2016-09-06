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


  module(title(adapter, '#mockFind'), inlineSetup(App, serializerType));
  SharedFactoryGuyTestHelperBehavior.mockFindRecordCommonTests();


  module(title(adapter, '#mockReload'), inlineSetup(App, serializerType));
  SharedFactoryGuyTestHelperBehavior.mockReloadTests();


  module(title(adapter, '#mockFindAll'), inlineSetup(App, serializerType));
  SharedFactoryGuyTestHelperBehavior.mockFindAllCommonTests();


  module(title(adapter, '#mockQuery'), inlineSetup(App, serializerType));
  SharedFactoryGuyTestHelperBehavior.mockQueryTests();


  module(title(adapter, '#mockQueryRecord'), inlineSetup(App, serializerType));
  SharedFactoryGuyTestHelperBehavior.mockQueryRecordTests();


  module(title(adapter, '#mockCreate'), inlineSetup(App, serializerType));
  SharedFactoryGuyTestHelperBehavior.mockCreateTests();


  module(title(adapter, '#mockUpdate'), inlineSetup(App, serializerType));
  SharedFactoryGuyTestHelperBehavior.mockUpdateTests();


  module(title(adapter, '#mockDelete'), inlineSetup(App, serializerType));
  SharedFactoryGuyTestHelperBehavior.mockDeleteTests();

};

export default SharedAdapterBehavior;