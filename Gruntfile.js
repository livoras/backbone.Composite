module.exports = function (grunt) {

	grunt.initConfig({
		uglify: {
			build: {
				options: {
					banner: '/*Backbone.Composite*/'
				},
				src: 'src/backbone.Composite.js',
				dest: 'bin/backbone.Composite.min.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('copy', "copy the file to bin" ,function () {
		 var exec = require('child_process').exec;
		 exec('cp src/backbone.Composite.js bin/backbone.Composite.js');
	});

	grunt.registerTask('default', ['uglify', 'copy']);
};