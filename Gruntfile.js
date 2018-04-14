module.exports = function(grunt) {

  "use strict";

  var webpack = require("webpack");
  var webpackConfig = require("./webpack.config.js");

  grunt.initConfig({
    clean: {
      src: "build"
    },
    eslint: {
      src: ['lib/*.js']
    },
    'http-server': {
      dev: {
        root: "example",
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          quiet: false, // Optionally suppress output to standard out (defaults to false)
          require: 'jsdom-global/register'
        },
        src: ['test/**/*.js']
      }
    },
    webpack: {
      options: webpackConfig,
      prod: {
        cache: true
      },
      dev: {
        cache: false
      }
    },
    uglify: {
      compress: {
        files: {
          "./build/andy-ab.min.js": "./build/andy-ab.js"
        },
        options: {
          mangle: true
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("gruntify-eslint");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks('grunt-http-server');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks("grunt-webpack");

  grunt.registerTask("default", [
    "build"
    ]);

  grunt.registerTask("build", [
    "test",
    "clean",
    "webpack",
    "uglify",
    ]);

  grunt.registerTask("test", [
    'eslint',
    "mochaTest"
    ]);
};
