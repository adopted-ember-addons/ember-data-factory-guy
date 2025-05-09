import sinon from 'sinon';

/**
 * Ensures after each test that sinon is restored, avoiding stubs/mocks being shared between tests
 */
export function installSinon(QUnit) {
  QUnit.testDone(function () {
    sinon.restore();
  });
}
