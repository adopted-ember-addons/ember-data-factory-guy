import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('dog', {
  default: {
    dogNumber: (f)=> `Dog${f.id}`,
    bark: 'Normal'
  }
});
