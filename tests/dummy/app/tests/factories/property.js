import FactoryGuy from '@eflexsystems/ember-data-factory-guy';

export default FactoryGuy.define('property', {
  default: {
    name: 'Silly property',
  },
  transient: {
    for_sale: true,
  },
  traits: {
    with_owners_with_projects: {
      owners: FactoryGuy.hasMany('user', 2, 'with_projects'),
    },
  },
  afterMake: function (model, attributes) {
    if (attributes.for_sale) {
      model.set('name', model.name + '(FOR SALE)');
    }
  },
});
