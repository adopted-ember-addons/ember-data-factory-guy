import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['employee'],
  didInsertElement() {
    this._super(...arguments);
    console.log('component',this.get('employee.name').getProperties(['firstName', 'lastName']));
  },
});

