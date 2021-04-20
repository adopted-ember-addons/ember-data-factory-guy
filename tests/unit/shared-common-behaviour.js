import { module } from 'qunit';
import SharedFactoryGuyBehaviour from './shared-factory-guy-behaviour';
import SharedAdapterBehaviour from './shared-adapter-behaviour';

let SharedBehavior = {};

SharedBehavior.all = function () {
  module('FactoryGuy#makeNew', function () {
    SharedFactoryGuyBehaviour.makeNewTests();
  });

  module('FactoryGuy#make', function () {
    SharedFactoryGuyBehaviour.makeTests();
  });

  module('FactoryGuy#makeList', function () {
    SharedFactoryGuyBehaviour.makeListTests();
  });

  module('#mockFindRecord', function () {
    SharedAdapterBehaviour.mockFindRecordCommonTests();
  });

  module('#mockReload', function () {
    SharedAdapterBehaviour.mockReloadTests();
  });

  module('#mockFindAll', function () {
    SharedAdapterBehaviour.mockFindAllCommonTests();
  });

  module('#mockQuery', function () {
    SharedAdapterBehaviour.mockQueryTests();
  });

  module('#mockQueryRecord', function () {
    SharedAdapterBehaviour.mockQueryRecordTests();
  });

  module('#mockCreate', function () {
    SharedAdapterBehaviour.mockCreateTests();
  });

  module('#mockUpdate', function () {
    SharedAdapterBehaviour.mockUpdateTests();
  });

  module('#mockDelete', function () {
    SharedAdapterBehaviour.mockDeleteTests();
  });
};

export default SharedBehavior;
