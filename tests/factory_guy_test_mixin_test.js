var testHelper, store;

module('FactoryGuyTestMixin with DS.RESTAdapter', {
  setup: function () {
    testHelper = TestHelper.setup(DS.RESTAdapter);
    store = testHelper.getStore();
  },
  teardown: function () {
    DS.RESTAdapter.reopen({
      namespace: '',
      host: ''
    })
    Em.run(function () {
      testHelper.teardown();
    });
  }
});


test("#buildURL without namespace", function () {
  equal(testHelper.buildURL('project'), '/projects', 'has no namespace by default');
})

test("#buildURL with namespace and host", function () {
  DS.RESTAdapter.reopen({
    host: 'https://dude.com',
    namespace: 'api/v1'
  })

  equal(testHelper.buildURL('project'), 'https://dude.com/api/v1/projects');
})

