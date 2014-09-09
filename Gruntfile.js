
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
    // Task configuration.
    clean: {
      dist: ['output'],
    },
    compress: {
      main: {
        options: {
          archive: '<%=pkg.name%>.zip'
        },
        files: [
          {
          expand:true,
          cwd:'output/',
          src: ['*.html','*.min.css','*.min.js','*.png', 'readme.txt', '*.svg'], 
          dest: '/', 
          filter: 'isFile'}, // includes files in path
        ]
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>',
        report: 'min'
      },
      admin: {
        src: ['source/script.js'],
        dest: 'output/script.min.js'
      },
    },

    recess: {
      options: {
        compile: true,
        banner: '<%= banner %>'
      },
      custom: {
        src: ['source/style.less'],
        dest: 'output/style.css'
      },
      custom_min: {
        options: {
          compress: true
        },
        src: ['source/style.less'],
        dest: 'output/style.min.css'
      },      
    },

    copy: {
      source: {
        expand:true,
        cwd:'source/',
        src: ['*.html','*.js','*.png','readme.txt', '*.svg'],
        dest: 'output'
      },
    },


    watch: {
      css: {
        files: 'source/**/*.less',
        tasks: ['recess','copy','compress'],
      },
      js:{
        files: 'source/**/*.js',
        tasks: ['uglify','copy','compress'],
      },
      img: {
        files: 'source/**/*.png',
        tasks: ['copy', 'compress'],
      },
      html: {
        files: 'source/**/*.html',
        tasks: ['copy', 'compress'],
      },
      svg: {
        files: 'source/**/*.svg',
        tasks: ['copy', 'compress'],
      }, 
    },
  });


  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');  
  grunt.loadNpmTasks('grunt-recess');
  grunt.loadNpmTasks('grunt-svgstore');

  // Full distribution task.
  grunt.registerTask('default', ['clean:dist', 'recess:custom_min', 'uglify','copy:source','compress']);

  grunt.event.on('watch', function(action, filepath, target) {
    grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
  });
};
