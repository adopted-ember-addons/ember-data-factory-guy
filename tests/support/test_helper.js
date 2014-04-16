TestHelper = Ember.Object.createWithMixins(FixtureFactoryHelperMixin,{

  /**
   * Setup with type of adapter
   *
   * @param adapter DS.FixtureAdapter or DS.ActiveModelSerializer or whatever
   */
  setup: function(adapter) {
    var container = new Ember.Container();
    this.set('container', container);
    this.set('adapter', adapter);

    container.register("model:user", User);
    container.register("model:project", Project);
    container.register("store:main", DS.Store.extend({adapter: adapter}));
    container.register('transform:string', DS.StringTransform);

    if (adapter.toString().match('Fixture')) {
      adapter.simulateRemoteResponse = false;
      adapter.latency = 0;
    }
    return this;
  }
});