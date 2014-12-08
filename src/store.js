(function () {
  DS.Store.reopen({
    /**
     @returns {Boolean} true if store's adapter is DS.FixtureAdapter
     */
    usingFixtureAdapter: function () {
      var adapter = this.adapterFor('application');
      return adapter instanceof DS.FixtureAdapter;
    },
    /**
      Deprecated in favor of FactoryGuy.make
     */
    makeFixture: function () {
      Ember.deprecate('DEPRECATION Warning: use FactoryGuy.make instead');
      FactoryGuy.make.call(FactoryGuy, arguments)
    },
    /**
      Deprecated in favor of FactoryGuy.makeList
     */
    makeList: function () {
      Ember.deprecate('DEPRECATION Warning: use FactoryGuy.makeList instead');
      FactoryGuy.makeList.call(FactoryGuy, arguments)
    },
    /**
     * Most of the work of making the model from the json fixture is going on here.
     * @param modelType
     * @param fixture
     * @returns {*}
     */
    makeModel: function (modelType, fixture) {
      var store = this,
          modelName = store.modelFor(modelType).typeKey,
          model;

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
            });
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
              belongsTofixture[hasManyName] = [];
            }
            belongsTofixture[hasManyName].push(fixture.id);
          }
        }
      });
    },
    /**
     Before pushing the fixture to the store, do some preprocessing. Descend into the tree
     of object data, and convert child objects to record instances recursively.

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
            store.findEmbeddedAssociationsForRESTAdapter(relationship.type, belongsToRecord);
            belongsToRecord = store.push(relationship.type, belongsToRecord);
            fixture[relationship.key] = belongsToRecord;
          }
        }
        if (relationship.kind == 'hasMany') {
          var hasManyRecords = fixture[relationship.key];
          if (Ember.typeOf(hasManyRecords) == 'array') {
            if (Ember.typeOf(hasManyRecords[0]) == 'object') {
              var records = Em.A();
              hasManyRecords.map(function (object) {
                store.findEmbeddedAssociationsForRESTAdapter(relationship.type, object);
                var record = store.push(relationship.type, object);
                records.push(record);
                return record;
              });
              fixture[relationship.key] = records;
            }
          }
        }
      });
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
            var belongsToName = self.findRelationshipName('belongsTo', child.constructor, model);
            if (belongsToName) {
              child.set(belongsToName, model);
            }
          });
        }
      });
    },
    findRelationshipName: function (kind, belongToModelType, childModel) {
      var relationshipName;
      Ember.get(belongToModelType, 'relationshipsByName').forEach(function (relationship, name) {
        if (relationship.kind == kind && childModel instanceof relationship.type) {
          relationshipName = relationship.key;
        }
      });
      return relationshipName;
    },
    findHasManyRelationshipNameForFixtureAdapter: function (belongToModelType, childModelType) {
      var relationshipName;
      Ember.get(belongToModelType, 'relationshipsByName').forEach(function (relationship, name) {
        if (relationship.kind == 'hasMany' && childModelType == relationship.type) {
          relationshipName = relationship.key;
        }
      });
      return relationshipName;
    },
    /**
     Adding a pushPayload for FixtureAdapter, but using the original with
     other adapters that support pushPayload.

     @param {String} type
     @param {Object} payload
     */
    pushPayload: function (type, payload) {
      var typeName, model;

      if (this.usingFixtureAdapter()) {
        if (Ember.typeOf(type) === 'string' && Ember.isPresent(payload) && Ember.isPresent(payload.id)){
          //pushPayload('user', {id:..})
          model = this.modelFor(type);
          FactoryGuy.pushFixture(model, payload);
          this.push(model, Ember.copy(payload, true));
        } else if(Ember.typeOf(type) === 'object' || Ember.typeOf(payload) === 'object') {
          //pushPayload({users: {id:..}}) OR pushPayload('user', {users: {id:..}})
          if(Ember.isBlank(payload)){
            payload = type;
          }

          for (var prop in payload) {
            typeName = Ember.String.camelize(Ember.String.singularize(prop));
            model = this.modelFor(typeName);

            this.pushMany(model, Ember.makeArray( Ember.copy(payload[prop], true) ));
            Ember.ArrayPolyfills.forEach.call(Ember.makeArray(payload[prop]), function(hash) {
              FactoryGuy.pushFixture(model, hash);
            }, this);
          }
        } else {
          throw new Ember.Error('Assertion Failed: You cannot use `store#pushPayload` with this method signature pushPayload(' + type + ',' + payload + ')');
        }
      } else {
        this._super(type, payload);
      }
    }
  });
})();
