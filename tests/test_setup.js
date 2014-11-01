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
    belonging_to_user: {
      user: FactoryGuy.belongsTo('user')
    },
    belonging_to_outfit: {
      outfit: FactoryGuy.belongsTo('outfit')
    }
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


FactoryGuy.define("sub_project", {
  sequences: {
    title: function (num) { return 'SubProject' + num }
  },
  default: {
    title: FactoryGuy.generate('title'),
    type: "SubProject"
  }
});
FactoryGuy.define('property', {
  default: {
    name: 'Silly property'
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

Progress = DS.Model.extend({});
Unit = DS.Model.extend({
  lesson: DS.belongsTo('lesson')
})

Lesson = DS.Model.extend({
  steps: DS.hasMany('step'),
  progress: DS.belongsTo('progress')
})

Step = DS.Model.extend({
  progress: DS.belongsTo('progress')
})


FactoryGuy.define( 'progress', {
  default: {}
});
FactoryGuy.define( 'step', {
  default: {
    progress: FactoryGuy.belongsTo('progress')
  }
});
FactoryGuy.define( 'lesson', {
  default: {
    steps: FactoryGuy.hasMany('step', 2),
    progress: FactoryGuy.belongsTo('progress')
  }
});
FactoryGuy.define( 'unit', {
  default: {
    lesson: FactoryGuy.belongsTo('lesson')
  }
});

Company = DS.Model.extend({
  name:    DS.attr('string'),
  profile: DS.belongsTo('profile'),
  users:   DS.hasMany('user', {async: true, inverse: 'company'}),
  projects: DS.hasMany('project', {async: true})
});

SmallCompany = Company.extend({
  owner: DS.belongsTo('user', {async: true}),
  projects: DS.hasMany('project')
});

Group = DS.Model.extend({
  versions: DS.hasMany('group')
})

BigGroup = Group.extend({
  group: DS.belongsTo('group')
})

SmallGroup = Group.extend({
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

Profile = DS.Model.extend({
  description:            DS.attr('string'),
  camelCaseDescription:   DS.attr('string'),
  snake_case_description: DS.attr('string'),
  company:                DS.belongsTo('company')
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
  company:    DS.belongsTo('company', {async: true, inverse: 'users', polymorphic: true}),
  properties: DS.hasMany('property', {async: true, inverse: 'owners'}),
  projects:   DS.hasMany('project'),
  hats:       DS.hasMany('hat', {polymorphic: true})
});
