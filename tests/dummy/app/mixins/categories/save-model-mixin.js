import Ember from 'ember';

export default Ember.Mixin.create({
  actions: {
    save: function() {
      var route = this;
      return this.currentModel.save().then(function() {
        route.transitionTo('categories');
      });
    }
  },
  deactivate: function() {
    if (this.currentModel.get('isNew')) {
      this.currentModel.deleteRecord();
    } else {
      this.currentModel.rollbackAttributes();
    }
  }
});
