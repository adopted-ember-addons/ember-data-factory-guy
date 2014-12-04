module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    concat: {
      dist: {
        src: [
          'src/sequence.js',
          'src/model_definition.js',
          'src/factory_guy.js',
          'src/store.js',
          'src/factory_guy_test_mixin.js',
        ],
        dest: "dist/ember-data-factory-guy.js"
      },
      amd: {
        src: [
          'src/prologue.js',
          'src/sequence.js',
          'src/model_definition.js',
          'src/factory_guy.js',
          'src/store.js',
          'src/factory_guy_test_mixin.js',
          'src/epilogue.js'
        ],
        dest: "dist/amd/factory-guy.js"
      },
      extra: {
        src: ['src/has_many.js'],
        dest: "dist/factory_guy_has_many.js"
      },
      gem: {
        files: {
          "vendor/assets/javascripts/ember_data_factory_guy.js": [
            'src/sequence.js',
            'src/model_definition.js',
            'src/factory_guy.js',
            'src/store.js',
            'src/factory_guy_test_mixin.js',
            'bower_components/jquery-mockjax/jquery.mockjax.js'],
          "vendor/assets/javascripts/factory_guy_has_many.js": ['src/has_many.js']
        }
      },
      test: {
        src: [
          'tests/support/factories/*.js',
          'tests/support/models/*.js',
          'tests/support/libs/*.js'],
        dest: "tests/test_setup.js"
      }
    },

    uglify: {
      options: { mangle: false, compress: false },

      dist: {
        src: ['dist/ember-data-factory-guy.js'],
        dest: 'dist/ember-data-factory-guy.min.js'
      }
    },

    qunit: {
      all: ['tests/*.html']
    },

    bump: {
      options: {
        files: ['package.json', 'bower.json'],
        commitFiles: ["-a"],
        push: false
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-bump');

  grunt.registerTask('default', ['concat', 'uglify']);
  grunt.registerTask('test', ['concat:dist', 'qunit']);
};