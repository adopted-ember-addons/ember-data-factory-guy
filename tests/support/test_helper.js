ObjectTransform = DS.Transform.extend({
  serialize: function(obj) {
    return obj ? JSON.parse(obj) : {};
  },
  deserialize: function(obj) {
    return obj ? JSON.stringify(obj) : '{}';
  }
});


TestHelper = Ember.Object.createWithMixins(FactoryGuy.testMixin,{

  /**
   * Setup with type of adapter instead of application root.
   *
   * @param adapter DS.FixtureAdapter or DS.ActiveModelSerializer or whatever
   */
  setup: function(adapter) {
    $.mockjaxSettings.logging = false;
    $.mockjaxSettings.responseTime = 0;

    var env = setupStore({
      adapter: adapter,
      hat: Hat,
      small_hat: SmallHat,
      big_hat: BigHat,
      soft_material: SoftMaterial,
      softMaterial: SoftMaterial,
      fluffy_material: FluffyMaterial,
      fluffyMaterial: FluffyMaterial,
      profile: Profile,
      user: User,
      company: Company,
      small_company: SmallCompany,
      property: Property,
      project: Project,
      person: Person,
      group: Group,
      big_group: BigGroup,
      small_group: SmallGroup,
      outfit: Outfit
    })

    if (adapter instanceof DS.FixtureAdapter) {
      adapter.simulateRemoteResponse = false;
    }
    // bypassing the parent TestHelper setup because there is no application
    // here in testing, just a container
    this.set('container', env.container);
    FactoryGuy.setStore(this.getStore());
    return this;
  }
});


(function (){

  window.setupStore = function(options) {
    var env = {};
    options = options || {};

    var container = env.container = new Ember.Container();

    var adapter = env.adapter = (options.adapter || DS.Adapter);
    delete options.adapter;

    for (var prop in options) {
      container.register('model:' + prop, options[prop]);
    }

    container.register('store:main', DS.Store.extend({
      adapter: adapter
    }));

    var serializer = DS.JSONSerializer;
    if (adapter == DS.ActiveModelAdapter) {
      serializer = DS.ActiveModelSerializer;
    } else if (adapter == DS.RESTAdapter) {
      serializer = DS.RESTSerializer;
    }

    container.register('serializer:-default', serializer);
    container.register('transform:string', DS.StringTransform);
    container.register('transform:date', DS.DateTransform);
    container.register('transform:object', ObjectTransform);
    container.injection('serializer', 'store', 'store:main');

    env.store = container.lookup('store:main');
    env.adapter = env.store.get('defaultAdapter');

    return env;
  };

  window.createStore = function(options) {
    return setupStore(options).store;
  };

})();
