import Ember from 'ember';
import FactoryGuy, { make } from 'ember-data-factory-guy';
import startApp from '../../helpers/start-app';

var App = null;

module('User Model', {
  beforeEach: function() {
    App = startApp();
  },
  afterEach: function() {
    //Ember.run(App, 'destroy');
  }
});

test('has funny name', function() {
  var  data = {
    "data": {
      "type": "project",
      "id": "1",
      "attributes": {
        "title": "JSON API paints my bikeshed!"
      },
      "relationships": {
        "user": {
          "data": { "id": "1", "type": "user" },
        }
      }
    },
    "included": [{
      "type": "user",
      "id": "1",
      "attributes": {
        "name": "Dan",
      },
      "relationships": {
        "hats": {
          data: [
            { "type": "big-hat", "id": "1" },
            { "type": "small-hat", "id": "2" }
          ]}
        }
    }, {
      "type": "big-hat",
      "id": "1",
      "attributes": {
        "type": "BigHat"
      },
      "relationships": {
        "outfit": {
          data: { id: 1, type: 'outfit' }
        }
      }
    }, {
      "type": "small-hat",
      "id": "2",
      "attributes": {
        "type": "SmallHat"
      }
    },{
      "type": "outfit",
      "id": "1",
      "attributes": {
        "name": "outfit"
      }
    }
    ]
  }
  //var data = {
  //  data: {
  //    type: 'user',
  //    id: '1',
  //    "attributes": {
  //      name: 'Rails is Omakase',
  //    },
  //    relationships: {
  //      //comments: {
  //      //  linkage: [{
  //      //    type: 'comments',
  //      //    id: '2'
  //      //  },{
  //      //    type: 'comments',
  //      //    id: '3'
  //      //  }]
  //      //},
  //      projects: {
  //        data: [{
  //          type: 'project',
  //          id: '1'
  //        }]
  //      }
  //    }
  //  },
  //  included: [{
  //    type: 'project',
  //    id: '1',
  //    attributes: {
  //      title: 'dhh'
  //    }
  //  }]
  //}

  //var data = {
  //  data: {
  //    type: 'project',
  //    id: '1',
  //    "attributes": {
  //      title: 'Rails is Omakase',
  //    },
  //    relationships: {
  //      //comments: {
  //      //  linkage: [{
  //      //    type: 'comments',
  //      //    id: '2'
  //      //  },{
  //      //    type: 'comments',
  //      //    id: '3'
  //      //  }]
  //      //},
  //      user: {
  //        data: {
  //          type: 'user',
  //          id: '1'
  //        }
  //      }
  //    }
  //  },
  //  included: [{
  //    type: 'user',
  //    id: '1',
  //    attributes: {
  //      name: 'dhh'
  //    }
  //  }]
  //}

  Em.run(function() {
    var store = FactoryGuy.getStore();
    var project = store.push(data);
    //var project = make('project', 'with_user');
    console.log('all users', store.peekAll('user').get('content.firstObject')+'')
    console.log('project title', project.get('title'))
    var user = project.get('user');
    console.log('project user',project.get('user')+'')
    console.log('project user project',project.get('user.projects.firstObject')+'')
    console.log('user hats',project.get('user.hats.length')+'')
    var hat = project.get('user.hats.firstObject')
    console.log('hats outfit', hat.get('type')+'', hat.get('outfit.name')+'')

    //var user = store.push(data);
    //console.log('user ',user)
    //console.log('user ',user.get('name'))
    //console.log('user ',user.get('projects.firstObject.user')+'')
    //console.log('user project',user.get('projects')+'')
  });

});

//test('has funny name', function() {
//  var user = make('user', {name: 'Dude'});
//  equal(user.get('funnyName'), 'funny Dude');
//});
//
//test('has projects', function() {
//  var user = make('user', 'with_projects');
//  equal(user.get('projects.length'), 2);
//});