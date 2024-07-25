// For manually setting up FactoryGuy in tests where the application is not started
import FactoryGuy from '../factory-guy';

export default function (scope) {
  let owner =
    scope.owner || (scope.container && scope.container.owner) || scope;

  FactoryGuy.reset(); // redundant, but can't hurt
  FactoryGuy.setStore(owner.lookup('service:store'));
}
