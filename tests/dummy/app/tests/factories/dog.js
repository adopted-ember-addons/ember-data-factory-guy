import FactoryGuy from '@eflexsystems/ember-data-factory-guy';
import { sound as mooSound } from '../helpers/moo';

const defaultVolume = 'Normal';

export default FactoryGuy.define('dog', {
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
