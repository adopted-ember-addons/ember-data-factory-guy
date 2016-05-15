import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('car', {
  default: {
    name: (f)=>`Car-${f.id}`
  },
});
