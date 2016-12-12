// For manually setting up FactoryGuy in unit/integration tests where the application is not started
import FactoryGuy from '../factory-guy';
import loadFactories from './load-factories';
import loadScenarios from './load-scenarios';

export default function(container) {
  FactoryGuy.setStore(container.lookup('service:store'));
  FactoryGuy.resetDefinitions();
  loadFactories();
  loadScenarios(container);
}

