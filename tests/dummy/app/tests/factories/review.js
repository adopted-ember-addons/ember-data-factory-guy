import FactoryGuy from '@eflexsystems/ember-data-factory-guy';

export default FactoryGuy.define('review', {
  default: {
    rating: FactoryGuy.generate((num) => num),
    date: new Date('2015-05-01'),
  },
});
