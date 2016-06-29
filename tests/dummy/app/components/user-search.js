import Ember from 'ember';

export default Ember.Component.extend({

  actions: {

    findUsers() {
      var name = this.$('input').val();
      this.sendAction('onFind', name);
    }

  }
});