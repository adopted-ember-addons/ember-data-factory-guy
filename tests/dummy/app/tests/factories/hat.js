import FactoryGuy from 'factory-guy';

FactoryGuy.define('hat', {
  default: {},
  'small-hat': {
    type: 'SmallHat'
  },
  'big-hat': {
    type: 'BigHat'
  },
  traits: {
    with_user: { user: {} },
    belonging_to_user: { user: {} },
    with_outfit: { outfit: {} },
    belonging_to_outfit: { outfit: {} }
  }
});
