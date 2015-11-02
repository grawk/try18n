'use strict';

module.exports = function dustjs(grunt) {
    grunt.loadNpmTasks('grunt-put-packages-in-requirejs-config');

    return {
        packages: {
            options: {
                src: 'public/js/config.js',
                dest: 'public/js/_config.js',
                packages: 'public/js/components'
            }
        }
    };
};

