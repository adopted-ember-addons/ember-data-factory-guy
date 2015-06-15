import FactoryGuy from 'ember-data-factory-guy';
import './group';

FactoryGuy.define("big-group", {
  extends: 'group',
  sequences: {
    // this 'name' sequence will override the parent's 'name' sequence
    name: function(num) {return 'Big Group' + num;}
  },
  /*
    By defining only the 'type' attribute, this will inherit only the 'name' attribute
    from the parent's default section which looks like this:

    default: {
      type: "Group",
      name: FactoryGuy.generate('name')
    }

  */
  default: {
    type: "BigGroup"
  }
});
