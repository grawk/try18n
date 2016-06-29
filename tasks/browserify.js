'use strict';

module.exports = function browserify(grunt) {
	// Load task
	grunt.loadNpmTasks('grunt-browserify');

	// Options
	return {
		build: {
			src: './public/js/main.js',
			dest: '.build/js/bundle.js'
			//,
			//options: {
			//	transform: ['reactify', 'require-globify']
			//}
		}
	};
};