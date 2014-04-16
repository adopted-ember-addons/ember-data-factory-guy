module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    concat: {
      dist: {
        src: ['src/fixture_factory.js', 'src/store.js', 'src/helper_mixin.js'],
        dest: "dist/ember-data-fixture-factory.js"
      },
      gem: {
        files: {
          "vendor/assets/javascripts/ember_data_fixture_factory.js": ['src/fixture_factory.js', 'src/store.js', 'src/helper_mixin.js'],
          "vendor/assets/javascripts/fixture_factory_has_many.js": ['src/has_many.js']
        }
      },
      test: {
        src: ['tests/support/factories/*.js', 'tests/support/models/*.js'],
        dest: "tests/test_setup.js"
      }
    },

    uglify: {
      options: { mangle: false, compress: false },

      dist: {
        src: ['dist/ember-data-fixture-factory.js'],
        dest: 'dist/ember-data-fixture-factory.min.js'
      }
    },

    qunit: {
      all: ['tests/*.html']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');

  grunt.registerTask('default', ['concat', 'uglify']);
  grunt.registerTask('test', ['concat', 'qunit']);
};