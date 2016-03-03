import Ember from 'ember';
import { make } from 'ember-data-factory-guy';

export default Ember.Route.extend({

  model(params) {
    return this.store.query('user', { name: params.name }).catch(e=>e);
  }

});
