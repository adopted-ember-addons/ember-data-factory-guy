import FactoryGuy from 'ember-data-factory-guy';
import { sound as mooSound } from '../helpers/moo';

const defaultVolume = 'Normal';

FactoryGuy.define('dog', {
  default: {
    dogNumber: (f) => `Dog${f.id}`,
    sound: (f) => `${f.volume || defaultVolume} Woof`,
    tag: (f) => {
      return { num: f.id };
    },
  },

  traits: {
    cowDog: { sound: mooSound },
    withOwner: { owner: FactoryGuy.belongsTo('employee') },
  },
});
