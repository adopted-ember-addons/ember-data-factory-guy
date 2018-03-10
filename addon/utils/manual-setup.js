// For manually setting up FactoryGuy in tests where the application is not started
import FactoryGuy from '../factory-guy';
import loadFactories from './load-factories';
import loadScenarios from './load-scenarios';

export default function(scope) {
  let owner =  scope.owner || (scope.container && scope.container.owner) || scope;

  FactoryGuy.reset(); // redundant, but can't hurt
  FactoryGuy.setStore(owner.lookup('service:store'));
  loadFactories();
  loadScenarios(owner);
}

