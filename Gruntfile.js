module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    concat: {
      dist: {
        src: ['src/factory_guy.js', 'src/store.js', 'src/factory_guy_helper_mixin.js'],
        dest: "dist/ember-data-factory-guy.js"
      },
      gem: {
        files: {
          "vendor/assets/javascripts/ember_data_factory_guy.js": ['src/factory_guy.js', 'src/store.js', 'src/factory_guy_helper_mixin.js'],
          "vendor/assets/javascripts/factory_guy_has_many.js": ['src/has_many.js']
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
        src: ['dist/ember-data-factory-guy.js'],
        dest: 'dist/ember-data-factory-guy.min.js'
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