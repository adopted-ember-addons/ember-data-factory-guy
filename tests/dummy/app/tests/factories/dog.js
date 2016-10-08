import FactoryGuy from 'ember-data-factory-guy';

const defaultVolume = "Normal";

FactoryGuy.define('dog', {
  default: {
    dogNumber: (f)=> `Dog${f.id}`,
    sound: (f) => `${f.volume||defaultVolume} Woof`
  },
});
