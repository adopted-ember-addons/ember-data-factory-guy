import Ember from 'ember';
import FactoryGuy, { make, makeList } from 'ember-data-factory-guy';
import TestHelper from 'ember-data-factory-guy/factory-guy-test-helper';

import SharedAdapterBehavior from './shared-adapter-tests';
import { title, inlineSetup } from '../helpers/utility-methods';

var App = null;
var adapter = 'DS.JSONAPIAdapter';
var adapterType = '-json-api';

SharedAdapterBehavior.all(adapter, adapterType);

//module(title(adapter, 'FactoryGuyTestHelper#handleFindAll'), inlineSetup(App, adapterType));

