import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('cat', {
  default: {
    name: (f)=> `Cat ${f.id}`
  }
});
