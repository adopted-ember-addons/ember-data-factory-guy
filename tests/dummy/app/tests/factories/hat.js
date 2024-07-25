import FactoryGuy from '@eflexsystems/ember-data-factory-guy';

export default FactoryGuy.define('hat', {
  traits: {
    big: { type: 'small-hat' },
    small: { type: 'big-hat' },
    round: { shape: 'round' },
    square: { shape: 'square' },
    with_user: { user: {} },
    belonging_to_user: { user: {} },
    with_outfit: { outfit: {} },
    belonging_to_outfit: { outfit: {} },
  },
});
