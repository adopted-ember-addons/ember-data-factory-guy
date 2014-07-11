TestHelper = Ember.Object.createWithMixins(FactoryGuyTestMixin,{

  /**
   * Setup with type of adapter instead of application root.
   *
   * @param adapter DS.FixtureAdapter or DS.ActiveModelSerializer or whatever
   */
  setup: function(adapter) {
    $.mockjaxSettings.logging = false;
    $.mockjaxSettings.responseTime = 0;
    var container = new Ember.Container();
    this.set('container', container);

    container.register("model:hat", Hat);
    container.register("model:small_hat", SmallHat);
    container.register("model:big_hat", BigHat);
    container.register("model:soft_material", SoftMaterial);
    container.register("model:user", User);
    container.register("model:profile", Profile);
    container.register("model:company", Company);
    container.register("model:project", Project);
    container.register("store:main", DS.Store.extend({adapter: adapter}));
    if (adapter == DS.ActiveModelAdapter) {
      container.register("serializer:-default", DS.ActiveModelSerializer);
    } else if (adapter == DS.RESTAdapter) {
      container.register("serializer:-default", DS.RESTSerializer);
    } else {
      container.register("serializer:-default", DS.JSONSerializer);
    }
    container.register('transform:string', DS.StringTransform);

    if (adapter instanceof DS.FixtureAdapter) {
      adapter.simulateRemoteResponse = false;
    }
    return this;
  }
});