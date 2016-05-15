import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('city', {
  default: {
    name: (f)=>`City-${f.id}`
  },
});
