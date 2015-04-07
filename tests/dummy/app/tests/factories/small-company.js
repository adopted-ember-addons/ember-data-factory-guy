import FactoryGuy from 'factory-guy';

FactoryGuy.define("small_company", {
  default: {
    name: 'Small Corp',
    projects: FactoryGuy.hasMany('project', 2)
  }
});
