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
    var store = this;
    var modelName = FactoryGuy.lookupModelForFixtureName(name);
    var fixture = FactoryGuy.build(name, options);
    var modelType = store.modelFor(modelName);

    if (this.usingFixtureAdapter()) {
      this.setAssociationsForFixtureAdapter(modelType, modelName, fixture);
      return FactoryGuy.pushFixture(modelType, fixture);
    } else {
      var store = this;

      var model;
      Em.run(function () {
        store.findEmbeddedAssociationsForRESTAdapter(modelType, fixture);
        if (fixture.type) {
          // assuming its polymorphic if there is a type attribute
          // is this too bold an assumption?
          modelName = fixture.type.underscore();
          modelType = store.modelFor(modelName);
        }
        model = store.push(modelName, fixture);
        store.setAssociationsForRESTAdapter(modelType, modelName, model);
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
   Set the hasMany and belongsTo associations for FixtureAdapter.

   For example, assuming a user hasMany projects, if you make a project,
   then a user with that project in the users list of project, then this method
   will go back and set the user.id on each project that the user hasMany of,
   so that the project now has the belongsTo user association setup.
   As in this scenario:

   ```js
   var projectJson = store.makeFixture('project');
   var userJson = store.makeFixture('user', {projects: [projectJson]});
   ```

   Or if you make a project with a user, then set this project in
   the users list of 'projects' it hasMany of. As in this scenario:

   ```js
   var userJson = store.makeFixture('user');
   var projectJson = store.makeFixture('project', {user: userJson});
   ```

   @param {DS.Model} modelType model type like User
   @param {String} modelName model name like 'user'
   @param {Object} fixture to check for needed association assignments
   */
  setAssociationsForFixtureAdapter: function (modelType, modelName, fixture) {
    var self = this;
    var adapter = this.adapterFor('application');
    Ember.get(modelType, 'relationshipsByName').forEach(function (relationship, name) {
      if (relationship.kind == 'hasMany') {
        var hasManyRelation = fixture[relationship.key];
        if (hasManyRelation) {
          $.each(fixture[relationship.key], function (index, object) {
            // used to require that the relationship was set by id,
            // but now, you can set it as the json object, and this will
            // normalize that back to the id
            var id = object;
            if (Ember.typeOf(object) == 'object') {
              id = object.id;
              hasManyRelation[index] = id;
            }
            var hasManyfixtures = adapter.fixturesForType(relationship.type);
            var fixture = adapter.findFixtureById(hasManyfixtures, id);
            fixture[modelName] = fixture.id;
          })
        }
      }

      if (relationship.kind == 'belongsTo') {
        var belongsToRecord = fixture[relationship.key];
        if (belongsToRecord) {
          if (typeof belongsToRecord == 'object') {
            FactoryGuy.pushFixture(relationship.type, belongsToRecord);
            fixture[relationship.key] = belongsToRecord.id;
          }
          var hasManyName = self.findHasManyRelationshipNameForFixtureAdapter(relationship.type, relationship.parentType);
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
   Before pushing the fixture to the store, do some preprocessing.

   If its a belongs to association, and the fixture has an object there,
   then push that model to the store and set the id of that new model
   as the attribute value in the fixture

   @param modelType
   @param fixture
   */
  findEmbeddedAssociationsForRESTAdapter: function (modelType, fixture) {
    var store = this;
    Ember.get(modelType, 'relationshipsByName').forEach(function (relationship, name) {
      if (relationship.kind == 'belongsTo') {
        var belongsToRecord = fixture[relationship.key];
        if (Ember.typeOf(belongsToRecord) == 'object') {
          belongsToRecord = store.push(relationship.type, belongsToRecord);
          fixture[relationship.key] = belongsToRecord;
        }
      }
      if (relationship.kind == 'hasMany') {
        var hasManyRecords = fixture[relationship.key];
        // if the records are objects and not instances they need to be converted to
        // instances
        if (Ember.typeOf(hasManyRecords) == 'array') {
          if (Ember.typeOf(hasManyRecords[0]) == 'object') {
            var records = Em.A()
            hasManyRecords.map(function (object) {
              var record = store.push(relationship.type, object);
              records.push(record);
              return record;
            })
            fixture[relationship.key] = records;
          }
        }
      }
    })
  },

  /**
   For the REST type models:

   For example if a user hasMany projects, then set the user
   on each project that the user hasMany of, so that the project
   now has the belongsTo user association setup. As in this scenario:

   ```js
   var project = store.makeFixture('project');
   var user = store.makeFixture('user', {projects: [project]});
   ```

   Or if you make a user, then a project with that user, then set the project
   in the users list of 'projects' it hasMany of. As in this scenario:

   ```js
   var user = store.makeFixture('user');
   var project = store.makeFixture('project', {user: user});
   ```

   NOTE:
   As of ember-data-1.0.0-beta.10 and ember-data-1.0.0-beta.12,
   this method is only needed because the belongsTo is not assigned when
   there is a self referential polymorphic has many association.

   @param {DS.Model} modelType model type like 'User'
   @param {String} modelName model name like 'user'
   @param {DS.Model} model model to check for needed association assignments
   */
  setAssociationsForRESTAdapter: function (modelType, modelName, model) {
    var self = this;
    Ember.get(modelType, 'relationshipsByName').forEach(function (relationship, name) {
      if (relationship.kind == 'hasMany') {
        var children = model.get(name) || [];
        children.forEach(function (child) {
          var belongsToName = self.findRelationshipName(
            'belongsTo',
            child.constructor,
            model
          );
          if (belongsToName) {
            child.set(belongsToName, model);
          }
        })
      }

    })
  },


  findRelationshipName: function (kind, belongToModelType, childModel) {
    var relationshipName;
    Ember.get(belongToModelType, 'relationshipsByName').forEach(
      function (relationship, name) {
        if (relationship.kind == kind &&
          childModel instanceof relationship.type) {
          relationshipName = relationship.key;
        }
      }
    )
    return relationshipName;
  },

  findHasManyRelationshipNameForFixtureAdapter: function (belongToModelType, childModelType) {
    var relationshipName;
    Ember.get(belongToModelType, 'relationshipsByName').forEach(
      function (relationship, name) {
        if (relationship.kind == 'hasMany' &&
          childModelType == relationship.type) {
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
