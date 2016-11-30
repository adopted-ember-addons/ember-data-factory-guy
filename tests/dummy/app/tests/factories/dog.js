import FactoryGuy from 'ember-data-factory-guy';
import {mooSound} from '../helpers/moo';

const defaultVolume = "Normal";

FactoryGuy.define('dog', {
  default: {
    dogNumber: (f)=> `Dog${f.id}`,
    sound: (f) => `${f.volume || defaultVolume} Woof`,
    tag: (f) => {
      return { num: f.id };
    }
  },

  traits: {
    cowDog: { sound: mooSound }
  }
});
