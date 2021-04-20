import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('profile', {
  default: {
    description: 'Text goes here',
    camelCaseDescription: 'textGoesHere',
    snake_case_description: 'text_goes_here',
    aBooleanField: false,
  },
  traits: {
    goofy_description: {
      description: 'goofy',
    },
    with_company: {
      company: FactoryGuy.belongsTo('company'),
    },
    with_bat_man: {
      superHero: FactoryGuy.belongsTo('bat_man'),
    },
    with_created_at: {
      created_at: new Date(),
    },
  },
});
