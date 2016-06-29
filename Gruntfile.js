'use strict';


module.exports = function (grunt) {

    // Load the project's grunt tasks from a directory
    require('grunt-config-dir')(grunt, {
        configDir: require('path').resolve('tasks')
    });
    grunt.loadNpmTasks('grunt-makara-browserify');
    // Register group tasks
    grunt.registerTask('build', ['jshint', 'less', 'browserify', 'makara-browserify', 'dustjs', 'copyto']);
    grunt.registerTask('postinstall', ['copy-browser-modules']);
    grunt.registerTask('test', [ 'jshint', 'mochacli' ]);
};
