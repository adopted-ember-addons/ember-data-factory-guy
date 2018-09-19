import Component from '@ember/component';

export default Component.extend({

  actions: {

    findUsers() {
      var name = this.$('input').val();
      this.userSearch(name);
    }

  }
});
