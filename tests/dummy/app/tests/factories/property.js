import FactoryGuy from 'ember-data-factory-guy';
import { run } from '@ember/runloop';

FactoryGuy.define('property', {
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
      run(() => model.set('name', model.get('name') + '(FOR SALE)'));
    }
  },
});
