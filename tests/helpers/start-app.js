import Ember from 'ember';
import Application from '../../app';
import Router from '../../router';
import config from '../../config/environment';

export default function startApp(attrs) {
  var application;

  var attributes = Ember.merge({}, config.APP);
  attributes = Ember.merge(attributes, attrs); // use defaults, but you can override;
  console.log('attributes',attributes)
  Ember.run(function() {
    application = Application.create(attributes);
    application.setupForTesting();
    application.injectTestHelpers();
  });

  return application;
}
