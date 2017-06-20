'use strict';


module.exports = function (grunt) {

    // Load the project's grunt tasks from a directory
    require('grunt-config-dir')(grunt, {
        configDir: require('path').resolve('tasks')
    });

    // Register group tasks
    grunt.registerTask('build', ['jshint', 'less', 'requirejs', 'makara-amdify', 'dustjs-configurable', 'copyto']);
    grunt.registerTask('postinstall', ['copy-browser-modules', 'put-packages-in-requirejs-config']);
    grunt.registerTask('test', [ 'jshint', 'mochacli' ]);
};
