
// For manually setting up FactoryGuy in unit/integration tests where the applicaiton is not started
import FactoryGuy from '../factory-guy';
import FactoryGuyTestHelper from '../factory-guy-test-helper';
import loadFactories from './load-factories';

export default function(container) {
  FactoryGuy.setStore(container.lookup('service:store'));
  FactoryGuyTestHelper.set('container', container);
  FactoryGuy.resetDefinitions();
  loadFactories();
}

