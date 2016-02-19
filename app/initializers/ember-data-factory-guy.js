import manualSetup from 'ember-data-factory-guy/utils/manual-setup';

export default {
  name: 'ember-data-factory-guy',
  after: 'ember-data',

  initialize: function (application) {
    if (arguments.length > 1) {
      application = arguments[1];
    }
    let container =  application.__container__;
    manualSetup(container);
  }
};
