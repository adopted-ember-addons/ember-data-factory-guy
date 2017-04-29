import Ember from 'ember';

export default Ember.Route.extend({

  model(params) {
    return this.store.query('user', { name: params.name }).catch(e=>e);
  }

});
