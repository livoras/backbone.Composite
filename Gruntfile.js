module.exports = function (grunt) {

	grunt.initConfig({
		uglify: {
			build: {
				options: {
					banner: '/*Backbone.CompositeView*/'
				},
				src: 'src/backbone.CompositeView.js',
				dest: 'bin/backbone.CompositeView.min.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('copy', "copy the file to bin" ,function () {
		 var exec = require('child_process').exec;
		 exec('cp src/backbone.CompositeView.js bin/backbone.CompositeView.js');
	});

	grunt.registerTask('default', ['uglify', 'copy']);
};