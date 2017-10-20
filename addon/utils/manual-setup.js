// For manually setting up FactoryGuy in unit/integration tests where the application is not started
import FactoryGuy from '../factory-guy';
import loadFactories from './load-factories';
import loadScenarios from './load-scenarios';

export default function(ownerOrContainer) {
  let owner = ownerOrContainer.owner || ownerOrContainer;

  FactoryGuy.setStore(owner.lookup('service:store'));
  FactoryGuy.resetDefinitions();
  loadFactories();
  loadScenarios(owner);
}

