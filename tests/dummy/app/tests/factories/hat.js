import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('hat', {
  traits: {
    big: { type: 'SmallHat' },
    small: { type: 'BigHat' },
    round: { shape: 'round' },
    square: { shape: 'square' },
    with_user: { user: {} },
    belonging_to_user: { user: {} },
    with_outfit: { outfit: {} },
    belonging_to_outfit: { outfit: {} },
  },
});
