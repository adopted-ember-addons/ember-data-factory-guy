FactoryGuy.define('user', {
  // default values for 'user' attributes
  default: {
    name: 'User1'
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
    }
  }
});


//Unit = DS.Model.extend({
//  lesson: DS.belongsTo('lesson')
//})
//
//Lesson = DS.Model.extend({
//  steps: DS.hasMany('step')
//})
//
//Step = DS.Model.extend({
//  lesson: DS.belongsTo ('lesson')
//})
//
//
//FactoryGuy.define('unit', {
//  default: {
//    lesson: FactoryGuy.belongsTo('lesson')
//  }
//})
//
//FactoryGuy.define('lesson', {
//  default: {
//    steps: FactoryGuy.hasMany('step', 2)
//  }
//})
//
//FactoryGuy.define('step', {
//  default: {}
//})
