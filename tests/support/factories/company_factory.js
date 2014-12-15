FactoryGuy.define("company", {
  default: {
    name: 'Silly corp'
  },
  traits: {
    with_projects: {
      projects: FactoryGuy.hasMany('project', 2)
    }
  }

})

FactoryGuy.define("small_company", {
  default: {
    name: 'Small Corp',
    projects: FactoryGuy.hasMany('project', 2)
  }
})
