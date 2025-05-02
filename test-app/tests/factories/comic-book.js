import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('comic-book', {
  default: {
    name: (f) => `Comic Times #${f.id}`,
  },
  traits: {
    marvel: {
      company: FactoryGuy.belongsTo('marvel'),
    },
    with_bad_guys: {
      characters: FactoryGuy.hasMany('villain', 2),
    },
    with_good_guys: {
      characters: FactoryGuy.hasMany('bat_man', 2),
    },
    with_included_villains: {
      includedVillains: FactoryGuy.hasMany('villain', 2),
    },
  },
});
