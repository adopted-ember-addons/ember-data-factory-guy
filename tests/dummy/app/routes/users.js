import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    let controller = this.controllerFor('users');

    return this.store.query('user', {page: 1}).then(users => {
      controller.set('previousPage', users.meta.previous);
      controller.set('nextPage', users.meta.next);
      return this.store.peekAll('user');
    });
  }
});
