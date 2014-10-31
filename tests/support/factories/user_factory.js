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
