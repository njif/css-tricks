'use strict';

/********************************
*********************************
			VARS
*********************************
*********************************/

var gulp = require('gulp'),
	fs = require('fs'),
	del = require('del'),
	header = require('gulp-header'),
	jshint = require('gulp-jshint'),
	processhtml = require('gulp-processhtml'),
	glob = require('glob'),
	es = require('event-stream'), //for merging the streams
	path = require('path'),
	autoprefixer = require('gulp-autoprefixer'),
	sourcemaps = require('gulp-sourcemaps'),
	concatCss = require("gulp-concat-css"),
	minifyCss = require("gulp-minify-css"),
	less = require('gulp-less'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	rename = require("gulp-rename"),
	notify = require("gulp-notify"),
	plumber = require('gulp-plumber'),

	connect = require('gulp-connect'),

	pkg = require('./package.json'),

	banner = ['/**',
  ' * <%= pkg.author %>',
  ' * <%= pkg.name %> v<%= pkg.version %>',
  ' */',
  ''].join('\n');


/********************************
*********************************
			TASKS
*********************************
*********************************/

gulp.task('default', ['connectToserver', 'build', 'watch']);
gulp.task('copyResources', ['copyImages']);
gulp.task('build', ['clearAssets', 'makeAssets', 'processStyles', 'copyAndProcessHtml']);

gulp.task('clearAssets', clearAssets);
gulp.task('clearAssetsResources', clearAssets);
gulp.task('makeAssets', makeAssets);

gulp.task('copyAndProcessHtml', ['copyHtml', 'processHtml']); // async: first, copy html files then process them
gulp.task('copyHtml', copyHtml);
gulp.task('processHtml', ['copyHtml'], processHtml);

gulp.task('processStyles', ['buildLess', 'processCss']); // async: first, build LESS files then process css
gulp.task('buildLess', buildLess);
gulp.task('processCss', ['buildLess'], processCss);


gulp.task('copyImages', copyImages);

gulp.task('connectToserver', connectToserver);

gulp.task('watch', watch);
gulp.task('watchCss', watchCss);
gulp.task('watchHtml', watchHtml);

/********************************
*********************************
			FUNCTIONS
*********************************
*********************************/

function clearAssets() {	
	del(['assets/**/**/*.js', 'assets/**/**/*.css', ], function (err) {
		console.log('scripts and styles in assets was deleted');
	});
}
function clearAssetsResources() {	
	del(['assets/img/*.*' ], function (err) {
		console.log('Images in assets was deleted');
	});
}

function makeAssets() {	
	if (!fs.existsSync('./assets')) {
		fs.mkdirSync('./assets');
	}
}


/* Process something */

function processHtml() {
	//Takes a glob string or an array of glob strings as the first argument.
	var files = glob.sync('./*.html'),
		streams;

	streams = files.map(function(file) {
		gulp.src(file)
			.pipe(processhtml(path.basename(file)))
			.pipe(gulp.dest('./'))
			.pipe(notify('Html processed!'));
	});
};

function buildLess() {
	return gulp.src('src/less/main.less')
		.pipe(less())
		.pipe(gulp.dest('src/assets/css'));
}

function processCss() {
	gulp.src([
			'bower_components/components-bootstrap/css/bootstrap.css ', 
			'src/assets/css/**/*.css'
		]).pipe(plumber())
		//.pipe(sourcemaps.init())
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(concatCss("bundle.css"))
		.pipe(minifyCss())
		//.pipe(sourcemaps.write())
		.pipe(rename('bundle.min.css'))
		.pipe(header(banner, { pkg : pkg } ))
		.pipe(gulp.dest('assets/css'))
		.pipe(connect.reload())
		.pipe(notify('Styles processed!'))
}

/* Copy only tasks */

function copyHtml() {
	return gulp.src('src/*.html')
		.pipe(plumber())
		.pipe(gulp.dest('./'))
		.pipe(notify('Html copied!'))
};

function copyImages() {
	gulp.src('src/assets/img/*.*')
		.pipe(plumber())
		.pipe(gulp.dest('assets/img'))
		.pipe(notify('Images copied!'));
};

/* Watch tasks */

function watchCss() {
	gulp.watch('src/assets/css/**/*.css', ['processCss']);
};

function watchHtml() {
	gulp.watch('src/*.html', ['processHtml']);
};

function watch() {
	gulp.run(['watchCss', 'watchHtml']);
};

function notifyChanges(event){
	notify(event.path+' -> '+event.type);
};


function connectToserver() {
	connect.server({
		root: './',
		livereload: true
	});
};