import Route from '@ember/routing/route';

export default Route.extend({
  model: function (params) {
    return this.store.findRecord('user', params.user_id).catch(() => null);
  },
});
