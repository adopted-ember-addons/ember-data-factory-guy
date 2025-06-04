import Application from 'test-app/app';
import config from 'test-app/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { loadTests } from 'ember-qunit/test-loader';
import { start, setupEmberOnerrorValidation } from 'ember-qunit';
import { installSinon } from 'test-app/tests/helpers/install-sinon';

import.meta.glob('./factories/**/*.{js,ts}');

installSinon(QUnit);

setApplication(Application.create(config.APP));

setup(QUnit.assert);

setupEmberOnerrorValidation();
loadTests();
start({
  setupTestIsolationValidation: true,
});
