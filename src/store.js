(function () {
  DS.Store.reopen({
    /**
     @returns {Boolean} true if store's adapter is DS.FixtureAdapter
     */
    usingFixtureAdapter: function () {
      var adapter = this.lookupAdapter('application');
      return adapter instanceof DS.FixtureAdapter;
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
        var hasManyRelation, belongsToRecord;
        if (relationship.kind == 'hasMany') {
          hasManyRelation = fixture[relationship.key];
          if (hasManyRelation) {
            $.each(fixture[relationship.key], function (index, object) {
              // used to require that the relationship was set by id,
              // but now, you can set it as the json object, and this will
              // normalize that back to the id
              var id = object;
              if (Ember.typeOf(object) == 'object') {
                FactoryGuy.pushFixture(relationship.type, object);
                id = object.id;
                hasManyRelation[index] = id;
              }
              var hasManyfixtures = adapter.fixturesForType(relationship.type);
              var hasManyFixture = adapter.findFixtureById(hasManyfixtures, id);
              hasManyFixture[modelName] = fixture.id;
              self.loadModelForFixtureAdapter(relationship.type, hasManyFixture);
            });
          }
        }
        if (relationship.kind == 'belongsTo') {
          belongsToRecord = fixture[relationship.key];
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
            self.loadModelForFixtureAdapter(relationship.type, belongsTofixture);
          }
        }
      });
    },

    loadModelForFixtureAdapter: function(modelType, fixture) {
      var storeModel = this.getById(modelType, fixture.id),
          that = this;
      if (!Ember.isPresent(storeModel) || storeModel.get('isEmpty')) {
        Ember.run(function () {
          var dup = Ember.copy(fixture, true);
          that.push(modelType, fixture);
          //replace relationships back to ids instead of built ember objects
          Ember.get(modelType, 'relationshipsByName').forEach(function (relationship, name) {
            if(fixture[relationship.key]) {
              fixture[relationship.key] = dup[relationship.key];
            }
          });
        });
      }
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
