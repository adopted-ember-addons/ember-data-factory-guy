FactoryGuy.define('property', {
  default: {
    name: 'Silly property'
  },
  traits: {
    with_owners_with_projects: {
      owners: FactoryGuy.hasMany('user', 2, 'with_projects')
    }
  }
})
