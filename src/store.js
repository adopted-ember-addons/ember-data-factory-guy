DS.Store.reopen({
  /**
   @returns {Boolean} true if store's adapter is DS.FixtureAdapter
   */
  usingFixtureAdapter: function () {
    var adapter = this.adapterFor('application');
    return adapter instanceof DS.FixtureAdapter;
  },

  /**
   Make new fixture and save to store. If the store is using FixtureAdapter,
   will push to FIXTURE array, otherwise will use push method on adapter.

   @param {String} name name of fixture
   @param {Object} options fixture options
   @returns {Object|DS.Model} json or record depending on the adapter type
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
      Em.run(function () {
        model = self.push(modelName, fixture);
        self.setBelongsToRESTAdapter(modelType, modelName, model);
      });
      return model;
    }
  },

  /**
   Make a list of Fixtures

   @param {String} name name of fixture
   @param {Number} number number to create
   @param {Object} options fixture options
   @returns {Array} list of json fixtures or records depending on the adapter type
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

   @param {String} modelType model type like App.User
   @param {String} modelName model name like 'user'
   @param {Object} parentFixture parent to assign as belongTo
   */
  setBelongsToFixturesAdapter: function(modelType, modelName, fixture) {
    var self = this;
    var adapter = this.adapterFor('application');
    Ember.get(modelType, 'relationshipsByName').forEach(function (name, relationship) {
      if (relationship.kind == 'hasMany') {
        if (fixture[relationship.key]) {
          fixture[relationship.key].forEach(function(id) {
            var hasManyfixtures = adapter.fixturesForType(relationship.type);
            var fixture = adapter.findFixtureById(hasManyfixtures, id);
            fixture[modelName] = fixture.id;
          })
        }
      }

      if (relationship.kind == 'belongsTo') {
        var belongsToRecord = fixture[relationship.key];
        if (belongsToRecord) {
          var hasManyName = self.findHasManyRelationshipName2(relationship.type, relationship.parentType);
          var belongsToFixtures = adapter.fixturesForType(relationship.type);
          var belongsTofixture = adapter.findFixtureById(belongsToFixtures, fixture[relationship.key]);
          if (!belongsTofixture[hasManyName]) {
            belongsTofixture[hasManyName] = []
          }
          belongsTofixture[hasManyName].push(fixture.id);
        }
      }
    })
  },

  /**
   For the REST type models:

   Set the belongsTo association with a hasMany association

   Set this model in the parent hasMany array this model belongsTo

   For example if a user hasMany projects, then set the user
   on each project that the user hasMany of, so that the project
   now has the belongsTo user association setup

   @param {DS.Model} modelType model type like 'User'
   @param {String} modelName model name like 'user'
   @param {DS.Model} model
   */
  setBelongsToRESTAdapter: function (modelType, modelName, model) {
    var self = this;
    Ember.get(modelType, 'relationshipsByName').forEach(function (name, relationship) {
      if (relationship.kind == 'hasMany') {
        var children = model.get(name) || [];
        children.forEach(function (child) {
          child.set(modelName, model)
        })
      }

      if (relationship.kind == 'belongsTo') {
        var belongsToRecord = model.get(name);
        if (belongsToRecord) {
          var hasManyName = self.findHasManyRelationshipName(belongsToRecord, model)
          belongsToRecord.get(hasManyName).addObject(model);
        }
      }
    })
  },

  findHasManyRelationshipName2: function (belongToModel, childModel) {
    var relationshipName;
    Ember.get(belongToModel, 'relationshipsByName').forEach(
      function (name, relationship) {
        if (relationship.kind == 'hasMany' &&
          relationship.type == childModel) {
          relationshipName = relationship.key;
        }
      }
    )
    return relationshipName;
  },
  findHasManyRelationshipName: function (belongToModel, childModel) {
    var relationshipName;
    Ember.get(belongToModel.constructor, 'relationshipsByName').forEach(
      function (name, relationship) {
        if (relationship.kind == 'hasMany' &&
          relationship.type == childModel.constructor) {
          relationshipName = relationship.key;
        }
      }
    )
    return relationshipName;
  },

  /**
   Adding a pushPayload for FixtureAdapter, but using the original with
   other adapters that support pushPayload.

   @param {String} type
   @param {Object} payload
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
   Overriding createRecord to add the record created to the
   hashMany records for all of the records that this record belongsTo.

   For example:

   If models are defined like so:

   User = DS.Model.extend({
       projects: DS.hasMany('project')
     })

   Project = DS.Model.extend({
       user: DS.belongsTo('user')
     })

   and you create a project record with a user defined:
    store.createRecord('project', {user: user})

   this method will take the new project created and add it to the user's 'projects'
   hasMany array.

   And a full code example:

   var userJson = store.makeFixture('user');

   store.find('user', userJson.id).then(function(user) {
       store.createRecord('project', {user: user}).save()
         .then( function(project) {
           // user.get('projects.length') == 1;
       })
     })

   @method createRecord
   @param {DS.Store} store
   @param {subclass of DS.Model} type
   @param {DS.Model} record
   @return {Promise} promise
   */
  createRecord: function (store, type, record) {
    var promise = this._super(store, type, record);

    promise.then(function () {
      var relationShips = Ember.get(type, 'relationshipNames');
      if (relationShips.belongsTo) {
        relationShips.belongsTo.forEach(function (relationship) {
          var belongsToRecord = record.get(relationship);
          if (belongsToRecord) {
            var hasManyName = store.findHasManyRelationshipName(belongsToRecord, record);
            belongsToRecord.get(hasManyName).addObject(record);
          }
        })
      }
    });

    return promise;
  }
})