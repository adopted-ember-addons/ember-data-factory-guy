import Application from 'test-app/app';
import config from 'test-app/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';
import { installSinon } from 'test-app/tests/helpers/install-sinon';

import 'test-app/tests/factories';

installSinon(QUnit);

setApplication(Application.create(config.APP));

setup(QUnit.assert);

start({
  setupTestIsolationValidation: true,
});
