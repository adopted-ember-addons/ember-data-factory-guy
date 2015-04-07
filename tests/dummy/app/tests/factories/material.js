import FactoryGuy from 'factory-guy';

FactoryGuy.define('soft-material', {
  default: {
    name: 'Soft material'
  },
  silk: {
    name: 'silk'
  }
});

FactoryGuy.define('fluffy-material', {
  default: {
    name: 'fluffy material'
  },
  silk: {
    name: 'fluff'
  }
});
