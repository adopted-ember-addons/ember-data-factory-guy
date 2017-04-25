import {mockFindAll, mockSetup, mockTeardown, manualSetup} from 'ember-data-factory-guy';
import {moduleFor, test} from 'ember-qunit';

moduleFor('route:profiles', 'Unit | forgetting to needs transform', {
  beforeEach() {
    manualSetup(this.container);
    mockSetup();
  },

  afterEach() {
    mockTeardown();
  },
   
  needs: [
    'model:profile',
//    'transform:just-a-string'  ( it's common to forget this needs )
  ]
});

test('profiles', function(assert) {
  let regex = new RegExp("\\[ember-data-factory-guy\\] could not find\\s*the \\[ just-a-string \\] transform");
  assert.throws(
    ()=>mockFindAll('profile', 2),
    regex,
    'factory guy produces a nice error message when you forget to needs a transform'
    );
});