module.exports = function(grunt) {

  "use strict";

  var webpack = require("webpack");
  var webpackConfig = require("./webpack.config.js");

  grunt.initConfig({
    clean: {
      src: ["build", "example/assets/js"]
    },
    copy: {
      files: {
        cwd: "./build",
        src: "andy-ab.min.js",
        dest: "example/assets/js",
        expand: true
      }
    },
    'http-server': {
      dev: {
        root: "example",
      }
    },
    jasmine : {
      src : 'build/**/*.js',
      options : {
        specs : 'spec/**/*.js'
      }
    },
    jasmine_node: {
      all: "spec/*/**.js"
    },
    jshint: {
      all: [
      "Gruntfile.js",
      "lib/*.js"
      ]
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
  grunt.loadNpmTasks("grunt-jasmine-node");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks('grunt-http-server');
  grunt.loadNpmTasks("grunt-webpack");

  grunt.registerTask("test", [
    "jshint",
    "jasmine_node"
    ]);

  grunt.registerTask("build", [
    "clean",
    "webpack",
    "uglify",
    "copy"
    ]);

  grunt.registerTask("default", [
    "test",
    "build"
    ]);
};
