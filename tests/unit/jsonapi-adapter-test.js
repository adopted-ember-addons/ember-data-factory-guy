import SharedFactoryGuyBehavior from './shared-factory-guy-tests';
import SharedFactoryGuyTestHelperBehavior from './shared-factory-guy-test-helper-tests';
import { title, inlineSetup } from '../helpers/utility-methods';

var App = null;
var adapter = 'DS.JSONAPIAdapter';
var adapterType = '-json-api';
//var adapterType = '-rest';
//var adapterType = '-active-model';

module(title(adapter, 'FactoryGuy#make'), inlineSetup(App, adapterType));
SharedFactoryGuyBehavior.makeTests();


module(title(adapter, 'FactoryGuy#makeList'), inlineSetup(App, adapterType));
SharedFactoryGuyBehavior.makeListTests();


module(title(adapter, 'FactoryGuy#build'), inlineSetup(App, adapterType));
SharedFactoryGuyBehavior.buildTests();


module(title(adapter, 'FactoryGuy#buildList'), inlineSetup(App, adapterType));
SharedFactoryGuyBehavior.buildListTests();
//SharedFactoryGuyBehavior.buildListJSONAPITests();

module(title(adapter, 'FactoryGuyTestHelper#handleReload'), inlineSetup(App, adapterType));
SharedFactoryGuyTestHelperBehavior.handleReloadTests();


module(title(adapter, 'FactoryGuyTestHelper#handleFindAll'), inlineSetup(App, adapterType));
SharedFactoryGuyTestHelperBehavior.handleFindAllTests();


//module(title(adapter, 'FactoryGuyTestHelper#handleFindQuery'), inlineSetup(App, adapterType));
//SharedFactoryGuyTestHelperBehavior.handleFindQueryTests();


module(title(adapter, 'FactoryGuyTestHelper#handleCreate'), inlineSetup(App, adapterType));
SharedFactoryGuyTestHelperBehavior.handleCreateTests();


module(title(adapter, 'FactoryGuyTestHelper#handleUpdate'), inlineSetup(App, adapterType));
SharedFactoryGuyTestHelperBehavior.handleUpdateTests();


module(title(adapter, 'FactoryGuyTestHelper#handleDelete'), inlineSetup(App, adapterType));
SharedFactoryGuyTestHelperBehavior.handleDeleteTests();
