Company = DS.Model.extend({
  type:    DS.attr('string', {defaultValue: 'Company'}),
  name:    DS.attr('string'),
  profile: DS.belongsTo('profile'),
  users:   DS.hasMany('user', {async: true, inverse: 'company'}),
  projects: DS.hasMany('project', {async: true})
});

SmallCompany = Company.extend({
  type:    DS.attr('string', {defaultValue: 'SmallCompany'}),
  owner: DS.belongsTo('user', {async: true}),
  projects: DS.hasMany('project')
});

Group = DS.Model.extend({
  type:    DS.attr('string', {defaultValue: 'Group'}),
  name:    DS.attr('string'),
  versions: DS.hasMany('group'),
  profiles: DS.hasMany('profile')
})

BigGroup = Group.extend({
  type:    DS.attr('string', {defaultValue: 'BigGroup'}),
  group: DS.belongsTo('group')
})

SmallGroup = Group.extend({
  type:    DS.attr('string', {defaultValue: 'SmallGroup'}),
  group: DS.belongsTo('group')
})


Hat = DS.Model.extend({
  type: DS.attr('string'),
  user: DS.belongsTo('user'),
  outfit: DS.belongsTo('outfit'),
  hat:  DS.belongsTo('hat', {inverse: 'hats', polymorphic: true}),
  hats: DS.hasMany('hat', {inverse: 'hat', polymorphic: true}),
  fluffy_materials: DS.hasMany('fluffy_materials')
});

BigHat = Hat.extend({
  materials: DS.hasMany('soft_material')
});
SmallHat = Hat.extend();



SoftMaterial = DS.Model.extend({
  name: DS.attr('string'),
  hat:  DS.belongsTo('big_hat')
})

FluffyMaterial = DS.Model.extend({
  name: DS.attr('string'),
  hat:  DS.belongsTo('hat', {polymorphic: true})
})

Outfit = DS.Model.extend({
  name: DS.attr('string'),
  hats: DS.hasMany('hat', {polymorphic: true})
})

Person = DS.Model.extend({
  type: DS.attr('string'),
  name: DS.attr('string'),
  company: DS.belongsTo('company', {embedded: 'always'}),
  outfits: DS.hasMany('outfit', {embedded: 'always'})
})

Profile = DS.Model.extend({
  created_at:             DS.attr('date'),
  description:            DS.attr('string'),
  camelCaseDescription:   DS.attr('string'),
  snake_case_description: DS.attr('string'),
  company:                DS.belongsTo('company'),
  group:                  DS.belongsTo('group', {polymorphic: true})
});

Project = DS.Model.extend({
  title:    DS.attr('string'),
  user:     DS.belongsTo('user'),
  parent:   DS.belongsTo('project', {inverse: 'children'}),
  children: DS.hasMany('project', {inverse: 'parent'})
});






Property = DS.Model.extend({
  name:    DS.attr('string'),
  company: DS.belongsTo('company', {async: true}),
  owners:  DS.hasMany('user', {async: true, inverse: 'properties'})
});
User = DS.Model.extend({
  name:       DS.attr('string'),
  info:       DS.attr('object'),
  company:    DS.belongsTo('company', {async: true, inverse: 'users', polymorphic: true}),
  properties: DS.hasMany('property', {async: true, inverse: 'owners'}),
  projects:   DS.hasMany('project', {embedded: 'always'}),
  hats:       DS.hasMany('hat', {polymorphic: true})
});


FactoryGuy.define("company", {
  default: {
    name: 'Silly corp'
  },
  traits: {
    with_profile: {
      profile: {}
    },
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

FactoryGuy.define("group", {
  sequences: {
    name: function(num) {return 'Group' + num}
  },
  default: {
    type: "Group",
    name: FactoryGuy.generate('name')
  }
});

FactoryGuy.define("big_group", {
  sequences: {
    name: function(num) {return 'Big Group' + num}
  },
  default: {
    type: "BigGroup",
    name: FactoryGuy.generate('name')
  }
})

FactoryGuy.define("small_group", {
  sequences: {
    name: function(num) {return 'Small Group' + num}
  },
  default: {
    type: "SmallGroup",
    name: FactoryGuy.generate('name')
  }
})
FactoryGuy.define('hat', {
  default: {},
  small_hat: {
    type: 'SmallHat'
  },
  big_hat: {
    type: 'BigHat'
  },
  traits: {
    with_user: { user: {} },
    belonging_to_user: { user: {} },
    with_outfit: { outfit: {} },
    belonging_to_outfit: { outfit: {} }
  }
})
FactoryGuy.define('soft_material', {
  default: {
    name: 'Soft material'
  },
  silk: {
    name: 'silk'
  }
})

FactoryGuy.define('fluffy_material', {
  default: {
    name: 'fluffy material'
  },
  silk: {
    name: 'fluff'
  }
})
FactoryGuy.define("outfit", {
  sequences: {
    name: function(num) {return 'Outfit' + num}
  },
  default: {
    name: FactoryGuy.generate('name')
  }
});

FactoryGuy.define('profile', {
  default: {
    description: 'Text goes here'
  },
  traits: {
    goofy_description: {
      description: 'goofy'
    },
    with_company: {
      company: FactoryGuy.belongsTo('company')
    }
  }
})
FactoryGuy.define("project", {
  sequences: {
    title: function(num) {return 'Project' + num}
  },
  traits: {
    big: { title: 'Big Project' },
    with_title_sequence: { title: FactoryGuy.generate('title') },
    with_user: { user: {} },
    with_user_having_hats: { user: FactoryGuy.belongsTo('user', 'with_hats') },
    with_user_having_hats_belonging_to_user: { user: FactoryGuy.belongsTo('user', 'with_hats_belonging_to_user') },
    with_user_having_hats_belonging_to_outfit: { user: FactoryGuy.belongsTo('user', 'with_hats_belonging_to_outfit') },
    with_dude: { user: {name: 'Dude'} },
    with_admin: { user: FactoryGuy.belongsTo('admin') }
  },
  default: {
    title: FactoryGuy.generate('title')
  },
  project_with_user: {
    // user model with default attributes
    user: {}
  },
  project_with_dude: {
    // user model with custom attributes
    user: {name: 'Dude'}
  },
  project_with_admin: {
    // for named association, use this FactoryGuy.association helper method
    user: FactoryGuy.belongsTo('admin')
  },
  project_with_parent: {
    // refer to belongsTo association where the name of the association
    // differs from the model name
    parent: FactoryGuy.belongsTo('project')
  }
});

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

FactoryGuy.define('user', {
  sequences: {
    name: function(num) {return 'User' + num}
  },
  // default values for 'user' attributes
  default: {
    name: FactoryGuy.generate('name')
  },
  // named 'user' type with custom attributes
  admin: {
    name: 'Admin'
  },
  user_with_projects: {
    projects: FactoryGuy.hasMany('project', 2)
  },
  traits: {
    with_company: {
      company: {}
    },
    with_projects: {
      projects: FactoryGuy.hasMany('project', 2)
    },
    with_hats: {
      hats: FactoryGuy.hasMany('big_hat', 2)
    },
    with_hats_belonging_to_user: {
      hats: FactoryGuy.hasMany('big_hat', 2, 'belonging_to_user')
    },
    with_hats_belonging_to_outfit: {
      hats: FactoryGuy.hasMany('big_hat', 2, 'belonging_to_outfit')
    }
  }
});

