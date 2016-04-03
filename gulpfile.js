/* ----- plugins ----- */

var gulp 		= require('gulp'),
	browserSync = require('browser-sync'),
	jade        = require('gulp-jade'),
	stylus 		= require('gulp-stylus');
	concat		= require('gulp-concat')

/* -----  paths ----- */

var paths = {
		jade : {
			location	: 'app/markups/**/*.jade',
			compiled	: 'app/markups/_pages/*.jade',
			destFolder	: 'dist/'
		},

		stylus : {
			mainStylFile: 'app/stylus/main.styl',
			location		: 'app/stylus/**/*.styl',
			destFolder	: 'dist/',
		},

		fonts : {
			location	: 'app/fonts/**/*',
			destFolder	: 'dist/fonts/',
		},

		js : {
			location	: 'app/js/**/*.js',
			destFile	: 'app.js',
			destFolder	: 'dist/',
		},

		libjs : {
			location	: ['node_modules/jquery/dist/jquery.min.js'],
			destFile	: 'libs.js',
			destFolder	: 'dist/',
		},

		images : {
			location	: 'app/img/**/*',
			destFolder	: 'dist/img/',
		},

		browserSync : {
			baseDir		: 'dist',
			watchPaths 	: ['dist/*.html', 'dist/*.css', 'dist/*.js']
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
	gulp.src(paths.js.location)
		.pipe(concat(paths.js.destFile))
		.pipe(gulp.dest(paths.js.destFolder));
});

/* ----- LibsJS ----- */

gulp.task('libjs', function() {
	gulp.src(paths.libjs.location)
		.pipe(concat(paths.libjs.destFile))
		.pipe(gulp.dest(paths.libjs.destFolder));
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

/* ----- Watch ----- */

gulp.task('watch', function(){
	gulp.watch(paths.jade.location, ['jade']);
	gulp.watch(paths.stylus.location, ['stylus']);
	gulp.watch(paths.js.location, ['js']);
	gulp.watch(paths.browserSync.watchPaths).on('change', browserSync.reload);
});

/* ----- Default ----- */

gulp.task('default', ['jade', 'stylus', 'js', 'libjs', 'fonts', 'images', 'sync', 'watch']);

/* ----- Build Task -----*/

gulp.task('build', ['jade', 'stylus', 'js', 'libjs', 'fonts', 'images']);