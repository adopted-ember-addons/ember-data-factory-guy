DS.Store.reopen({
  /**
    Make new fixture and save to store. If the store is using FixtureAdapter,
    will push to FIXTURE array, otherwise will use push method on adapter.

    @param name
    @param options
    @returns {*}
   */
  makeFixture: function (name, options) {
    var modelName = FactoryGuy.lookupModelForName(name);
    var fixture = FactoryGuy.build(name, options);
    var modelType = this.modelFor(modelName);

    var adapter = this.adapterFor('application');
    if (adapter.toString().match('Fixture')) {
      this.setBelongsToFixturesAssociation(modelType, modelName, fixture);
      return FactoryGuy.pushFixture(modelType, fixture);
    } else {
      var model = this.push(modelName, fixture);
      this.setBelongsToRestAssociation(modelType, modelName, model);
      return model;
    }
  },

  /**
    Trying to set the belongsTo association for FixtureAdapter,
      with models that have a hasMany association.

    For example if a client hasMany projects, then set the client.id
    on each project that the client hasMany of, so that the project
    now has the belongsTo client association setup.

    @param name
    @param model
   */
  setBelongsToFixturesAssociation: function (modelType, modelName, parentFixture) {
    var store = this;
    var adapter = this.adapterFor('application');
    var relationShips = Ember.get(modelType, 'relationshipNames');
    if (relationShips.hasMany) {
      relationShips.hasMany.forEach(function (relationship) {
        var hasManyModel = store.modelFor(Em.String.singularize(relationship));
        if (parentFixture[relationship]) {
          parentFixture[relationship].forEach(function(id) {
            var hasManyfixtures = adapter.fixturesForType(hasManyModel);
            var fixture = adapter.findFixtureById(hasManyfixtures, id);
            fixture[modelName] = parentFixture.id;
          })
        }
      })
    }
  },

  /**
   * Trying to set the belongsTo association for the rest type models
   * with a hasMany association
   *
   * For example if a client hasMany projects, then set the client
   * on each project that the client hasMany of, so that the project
   * now has the belongsTo client association setup
   *
   * @param modelType
   * @param modelName
   * @param parent model to check for hasMany
   */
  setBelongsToRestAssociation: function (modelType, modelName, parent) {
    var relationShips = Ember.get(modelType, 'relationshipNames');

    if (relationShips.hasMany) {
      relationShips.hasMany.forEach(function (name) {
        var children = parent.get(name);
        if (children.get('length') > 0) {
          children.forEach(function(child) {
            child.set(modelName, parent)
          })
        }
      })
    }
  },

  /**
    Adding a pushPayload for FixtureAdapter, but using the original with
     other adapters that support pushPayload.

    @param type
    @param payload
   */
  pushPayload: function (type, payload) {
    var adapter = this.adapterFor('application');
    if (adapter.toString().match('Fixture')) {
      var model = this.modelFor(modelName);
      FactoryGuy.pushFixture(model, payload);
    } else {
      this._super(type, payload);
    }
  }
});