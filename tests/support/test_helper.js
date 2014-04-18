TestHelper = Ember.Object.createWithMixins(FactoryGuyHelperMixin,{

  /**
   * Setup with type of adapter
   *
   * @param adapter DS.FixtureAdapter or DS.ActiveModelSerializer or whatever
   */
  setup: function(adapter) {
    var container = new Ember.Container();
    this.set('container', container);

    container.register("model:user", User);
    container.register("model:project", Project);
    container.register("store:main", DS.Store.extend({adapter: adapter}));
    container.register('transform:string', DS.StringTransform);

    if (adapter.toString().match('Fixture')) {
      adapter.simulateRemoteResponse = false;
    }
    return this;
  }
});