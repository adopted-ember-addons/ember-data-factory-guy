import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('user', {
  sequences: {
    name: (num) => `User${num}`
  },
  // default values for 'user' attributes
  default: {
    style: 'normal',
    name: FactoryGuy.generate('name'),
    company: (f) => ({links: `/users/${f.id}/company`}),
  },
  // named 'user' type with custom attributes
  admin: {
    name: 'Admin',
    style: 'super'
  },
  // 'bob' user with it's custom attributes
  bob: {
    name: 'Bob',
    style: 'boblike'
  },
  // can accomplish this with traits ( see 'with_projects' trait below )
  user_with_projects: {
    projects: FactoryGuy.hasMany('project', 2)
  },
  traits: {
    silly: {
      style: 'silly'
    },
    whacky: {
      style: 'whacky'
    },
    boblike: {
      name: 'Bob',
      style: 'boblike'
    },
    adminlike: {
      name: 'Admin',
      style: 'super'
    },
    with_company: {
      company: {}
    },
    with_projects: {
      projects: FactoryGuy.hasMany('project', 2)
    },
    with_projects_splat: {
      projects: FactoryGuy.hasMany('project', 'big', 'small', {title: "Cool Project"})
    },
    with_hats: {
      hats: FactoryGuy.hasMany('big-hat', 2)
    },
    with_hats_belonging_to_user: {
      hats: FactoryGuy.hasMany('big-hat', 2, 'belonging_to_user')
    },
    with_hats_belonging_to_outfit: {
      hats: FactoryGuy.hasMany('big-hat', 2, 'belonging_to_outfit')
    },
    propertiesLink: (f) => {
      f.properties = {links: `/users/${f.id}/properties`}
    }
  }
});

