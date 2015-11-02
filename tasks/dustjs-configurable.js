'use strict';

var path = require('path');

module.exports = function dustjs(grunt) {
    // Load task
    grunt.loadNpmTasks('grunt-dustjs-configurable');

    // Options
    return {
        amd: {
            files: [
                {
                    expand: true,
                    cwd: 'public/templates',
                    src: '**/*.dust',
                    dest: '.build/js/templates',
                    ext: '.dust.js'
                }
            ],
            options: {
                amd: true,
                fullname: function (filepath) {
                    return path.relative('public', filepath);
                }
            }
        }
    };
};
