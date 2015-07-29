import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('profile', {
  default: {
    description: 'Text goes here',
    camelCaseDescription: 'textGoesHere',
    snake_case_description: 'text_goes_here'
  },
  traits: {
    goofy_description: {
      description: 'goofy'
    },
    with_company: {
      company: FactoryGuy.belongsTo('company')
    }
  }
});
