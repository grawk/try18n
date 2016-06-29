'use strict';

var path = require('path');

module.exports = function dustjs(grunt) {
	// Load task
	grunt.loadNpmTasks('grunt-dustjs');

	// Options
	return {
		compile: {
			files: [
				{
					expand: true,
					cwd: 'dust/',
					src: '**/*.html',
					dest: '',
					ext: '.js'
				}
			]
		}
	};
};
