/* ----- plugins ----- */

var gulp        = require('gulp'),
    browserSync = require('browser-sync'),
    server      = require('gulp-develop-server'),
    jade        = require('gulp-jade'),
    stylus      = require('gulp-stylus'),
    browserify  = require('browserify'),
    source      = require('vinyl-source-stream'),
    buffer      = require('vinyl-buffer'),
    concat      = require('gulp-concat');

/* -----  paths ----- */

var paths = {
    jade : {
      location   : 'app/markups/**/*.jade',
      compiled   : 'app/markups/_pages/*.jade',
      destFolder : 'dist/'
    },

    stylus : {
      mainStylFile : 'app/stylus/main.styl',
      location     : 'app/stylus/**/*.styl',
      destFolder   : 'dist/',
    },

    fonts : {
      location    : 'app/fonts/**/*',
      destFolder  : 'dist/fonts/',
    },

    js : {
      location   : 'app/js/**/*.js',
      destFile   : 'app.js',
      destFolder : 'dist/',
    },

    images : {
      location   : 'app/img/**/*',
      destFolder : 'dist/img/',
    },

    server : {
      location : 'app/server.js'
    },

    browserSync : {
      baseDir    : 'dist',
      watchPaths : ['dist/*.html', 'dist/*.css', 'dist/*.js']
    },
}

/* ----- Jade ----- */

gulp.task('jade', function() {
  gulp.src(paths.jade.compiled)
    .pipe(jade({
      pretty: '\t',
    }))
    .pipe(gulp.dest(paths.jade.destFolder))
    .pipe(browserSync.stream());
});

/* ----- Stylus ----- */

gulp.task('stylus', function() {
  gulp.src(paths.stylus.mainStylFile)
    .pipe(stylus())
    .pipe(gulp.dest(paths.stylus.destFolder));
});

/* ----- JS ----- */

gulp.task('js', function() {
  browserify('app/js/main.js')
    .bundle()
    .pipe(source(paths.js.destFile))
    .pipe(buffer())
    .pipe(gulp.dest(paths.js.destFolder));
});

/* ----- Images ----- */

gulp.task('images', function() {
  gulp.src(paths.images.location)
    .pipe(gulp.dest(paths.images.destFolder));
});

/* ----- Fonts ----- */

gulp.task('fonts', function() {
  gulp.src(paths.fonts.location)
    .pipe(gulp.dest(paths.fonts.destFolder));
});

/* ----- Browser sync ----- */

gulp.task('sync', function() {
  browserSync.init({
    port: 9000,
    server: {
      baseDir: paths.browserSync.baseDir
    }
  });
});

/* ----- Develop Server ----- */

gulp.task('server:start', function() {
  server.listen({ 
    path: paths.server.location 
  });
});

/* ----- Watch ----- */

gulp.task('watch', function(){
  gulp.watch(paths.jade.location, ['jade']);
  gulp.watch(paths.stylus.location, ['stylus']);
  gulp.watch(paths.js.location, ['js']);
  gulp.watch(paths.browserSync.watchPaths).on('change', browserSync.reload);
});

/* ----- Default ----- */

gulp.task('default', ['jade', 'stylus', 'js', 'fonts', 'images', 'sync', 'server:start', 'watch']);

/* ----- Build Task -----*/

gulp.task('build', ['jade', 'stylus', 'js', 'fonts', 'images']);