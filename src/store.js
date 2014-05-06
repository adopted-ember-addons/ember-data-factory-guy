DS.Store.reopen({

  usingFixtureAdapter: function() {
    var adapter = this.adapterFor('application');
    return adapter instanceof DS.FixtureAdapter
  },

  /**
    Make new fixture and save to store. If the store is using FixtureAdapter,
    will push to FIXTURE array, otherwise will use push method on adapter.

    @param name name of fixture
    @param options fixture options
    @returns json or record
   */
  makeFixture: function (name, options) {
    var modelName = FactoryGuy.lookupModelForName(name);
    var fixture = FactoryGuy.build(name, options);
    var modelType = this.modelFor(modelName);

    if (this.usingFixtureAdapter()) {
      this.setBelongsToFixturesAdapter(modelType, modelName, fixture);
      return FactoryGuy.pushFixture(modelType, fixture);
    } else {
      var self = this;
      var model;
      Em.run( function() {
        model = self.push(modelName, fixture);
        self.setBelongsToRESTAdapter(modelType, modelName, model);
      });
      return model;
    }
  },

  /**
    Make a list of Fixtures

    @param name name of fixture
    @param number number of fixtures
    @param options fixture options
    @returns list of json fixtures or records depending on the adapter type
  */
  makeList: function (name, number, options) {
    var arr = [];
    for (var i = 0; i < number; i++) {
      arr.push(this.makeFixture(name, options))
    }
    return arr;
  },

  /**
    Set the belongsTo association for FixtureAdapter,
      with models that have a hasMany association.

    For example if a user hasMany projects, then set the user.id
    on each project that the user hasMany of, so that the project
    now has the belongsTo user association setup.

    @param modelType model type like App.User
    @param modelName model name like 'user'
    @param parentFixture parent to assign as belongTo
   */
  setBelongsToFixturesAdapter: function (modelType, modelName, parentFixture) {
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
    Set the belongsTo association for the REST type models
      with a hasMany association

    For example if a user hasMany projects, then set the user
    on each project that the user hasMany of, so that the project
    now has the belongsTo user association setup

    @param modelType model type like 'App.User'
    @param modelName model name like 'user'
    @param parent model to check for hasMany
   */
  setBelongsToRESTAdapter: function (modelType, modelName, parent) {
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
    if (this.usingFixtureAdapter()) {
      var model = this.modelFor(modelName);
      FactoryGuy.pushFixture(model, payload);
    } else {
      this._super(type, payload);
    }
  }
});


DS.FixtureAdapter.reopen({

  /**
    Overriding createRecord in FixtureAdapter to add the record
     created to the hashMany records for all of the records that
     this one belongsTo.

    @method createRecord
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {DS.Model} record
    @return {Promise} promise
  */
  createRecord: function(store, type, record) {
    var promise = this._super(store, type, record);

//    promise.then( function() {
//      var hasManyName = Ember.String.pluralize(type.typeKey);
//      var relationShips = Ember.get(type, 'relationshipNames');
//      if (relationShips.belongsTo) {
//        console.log('record',record+'', type.typeKey, hasManyName);
//        relationShips.belongsTo.forEach(function (relationship) {
//          console.log(relationship, record.get(relationship)+'')
//          var belongsToRecord = record.get(relationship);
//          console.log(relationshipForType)
//          belongsToRecord.get(hasManyName).addObject(record);
//        })
//      }
//    })
    return promise;
  }

})

