import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('project', {
  sequences: {
    title: (num) => `Project${num}`,
  },
  traits: {
    big: { title: 'Big Project' },
    medium: (f) => {
      // using function for trait
      f.title = `Medium Project ${f.id}`;
    },
    small: { title: 'Small Project' },
    with_title_sequence: { title: FactoryGuy.generate('title') },
    with_user: { user: {} },
    with_parent: { project: {} },
    with_user_having_hats: { user: FactoryGuy.belongsTo('user', 'with_hats') },
    with_user_having_hats_belonging_to_user: {
      user: FactoryGuy.belongsTo('user', 'with_hats_belonging_to_user'),
    },
    with_user_having_hats_belonging_to_outfit: {
      user: FactoryGuy.belongsTo('user', 'with_hats_belonging_to_outfit'),
    },
    with_dude: { user: { name: 'Dude' } },
    with_admin: { user: FactoryGuy.belongsTo('admin') },
  },
  default: {
    title: FactoryGuy.generate('title'),
  },

  // All the following project '_with_somethings' can be declared as traits.
  // But doing them in this style as well to show how it might be done

  project_with_user: {
    // user model with default attributes
    user: {},
  },
  project_with_dude: {
    // user model with custom attributes
    user: { name: 'Dude' },
  },
  project_with_admin: {
    // for named association, use this FactoryGuy.association helper method
    user: FactoryGuy.belongsTo('admin'),
  },
  project_with_parent: {
    // refer to belongsTo association where the name of the association
    // differs from the model name
    parent: FactoryGuy.belongsTo('project'),
  },
});
