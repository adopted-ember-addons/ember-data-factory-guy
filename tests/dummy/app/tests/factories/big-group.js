import FactoryGuy from 'ember-data-factory-guy';
// Make sure 'group' factory is loaded or else error is thrown
// when this factory goes to find it's definition and it's not available
import './group';

FactoryGuy.define('big-group', {
  extends: 'group',
  sequences: {
    // this 'name' sequence will override the parent's 'name' sequence
    name: function (num) {
      return 'Big Group' + num;
    },
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
    type: 'BigGroup',
  },
});
