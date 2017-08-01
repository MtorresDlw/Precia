var gulp = require('gulp'),
  connect = require('gulp-connect'),
  browserSync = require('browser-sync').create(),
  watchify = require('watchify'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  gutil = require('gulp-util'),
  sourcemaps = require('gulp-sourcemaps'),
  assign = require('lodash.assign'),
  del = require('del'),
  less = require('gulp-less'),
  shell = require('gulp-shell'),
  runSequence = require('run-sequence'),
  modRewrite = require('connect-modrewrite'),
  templateCache = require('gulp-angular-templatecache'),
  uglify = require('gulp-uglify');;

//var backendUrl  = 'http://sbe1-vm-gwdev.stowint.be:8000/sap/opu/odata/sap/ZFIELD_SRV';
//var backendUrl  = 'http://scvwis0423.dcsc.be:8100/sap/opu/odata/sap/ZFIELD_SRV';
//var backendUrl = 'http://gsusapdp01.group.ad:8001/sap/opu/odata/sap/ZFIELD_SRV';
var backendUrl = 'http://rdwdcr03.bt.dcsc.be:50000/sap/opu/odata/sap/ZFIELD_SRV';

//start webserver
gulp.task('connect', function() {
  connect.server({
    root: 'app',
    livereload: true,
    port: 8080,
    middleware: function() {
      return [
        modRewrite([
          '^/api/(.*)$ ' + backendUrl + '/$1 [P]',
          '^/build/api/(.*)$ ' + backendUrl + '/$1 [P]'
        ])
      ];
    }
  });
});

gulp.task('browser-sync', function() {
  browserSync.init({
    proxy: "preciafd"
  });
});

//task to reload when changing gulp file
gulp.task('gulp-reload', function() {
  connect.reload();
  gulp.watch(['./gulpfile.js'], ['fontawesome', 'fonts', 'js', 'html']);
});

gulp.task('watch', function() {
  //gulp.watch(['./app/scripts/app.js', './app/scripts/*/**.js', '!./app/scripts/bundle.js'], ['js']);
  gulp.watch(['./app/*.html', './app/**/*.html', './app/scripts/directives/partials/*.html'], ['templates']);
  gulp.watch(['./app/views/*.html'], ['templates']);
  gulp.watch(['./app/css/*.less', './app/css/**/*.less'], ['less']);
});

gulp.task('html', function() {
  gulp.src(['./app/*.html', './app/**/*.html'])
    .pipe(connect.reload());
});

gulp.task('less', function() {
  return gulp.src('./app/css/main.less')
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(less())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./app/css'))
    .pipe(connect.reload());
});

gulp.task('fonts', function() {
  return gulp.src(['./bower_components/fontawesome/fonts/**'])
    .pipe(gulp.dest('./app/fonts'));
});

gulp.task('fontawesome', function() {
  return gulp.src([
      './bower_components/fontawesome/css/font-awesome.css',
      './bower_components/bootstrap/dist/css/bootstrap.css'
    ])
    .pipe(gulp.dest('./app/css'));
});

gulp.task('copy-html', function(){
  return gulp.src(['./app/*.html', './app/**/*.html'])
    .pipe(gulp.dest('./dist'));
});

gulp.task('copy-js', function(){
  return gulp.src(['./app/scripts/bundle.js', './app/scripts/bundle.js.map', './app/scripts/platformOverrides.js'])
    .pipe(gulp.dest('./dist/scripts/'));
});

gulp.task('copy-css', function(){
  return gulp.src('./app/css/*.css')
  //gulp.src(['./app/css/main.css', './app/css/*.eot', './app/css/*.svg', './app/css/*.ttf', './app/css/*.woff'])
    .pipe(gulp.dest('./dist/css/'));
});

gulp.task('copy-fonts', function(){
  return gulp.src(['./app/fonts/*'])
    .pipe(gulp.dest('./dist/fonts'));
});

gulp.task('copy-images', function(){
  return gulp.src('./app/img/*')
    .pipe(gulp.dest('./dist/img'));
});

gulp.task('copy-mock', function(){
  return gulp.src('./app/mock/*')
    .pipe(gulp.dest('./dist/mock'));
});

gulp.task('copy', function() {
  del.sync('./dist/**');

  runSequence('copy-html', 'copy-js', 'copy-css', 'copy-fonts', 'copy-images');
});

gulp.task('copy-cordova', function(){
  del.sync('./www');
  return gulp.src('./dist/**/*').pipe(gulp.dest('./www'));
});

gulp.task('shell', shell.task([
    'cordova platform add android'
  ]));
gulp.task('shell-build', shell.task([
    'cordova prepare windows'
  ]));

// add custom browserify options here
var customOpts = {
  entries: ['./app/scripts/app.js'],
  debug: true
};
var opts = assign({}, watchify.args, customOpts);
var b = watchify(browserify(opts));

gulp.task('js', bundle); // so you can run `gulp js` to build the file
b.on('update', bundle); // on any dep update, runs the bundler
b.on('log', gutil.log); // output build logs to terminal

function bundle() {
  return b.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    // optional, remove if you don't need to buffer file contents
    .pipe(buffer())
    // optional, remove if you dont want sourcemaps
    .pipe(sourcemaps.init({
      loadMaps: true
    })) // loads map from browserify file
    // Add transformation tasks to the pipeline here.
    .pipe(sourcemaps.write('./')) // writes .map file
    .pipe(gulp.dest('./app/scripts'))
    .pipe(connect.reload());
}

gulp.task('templates', function () {
  gulp.src(['app/views/*.html', 'app/views/partials/*.html'])
    .pipe(templateCache({
      standalone:true
    }))
    .pipe(gulp.dest('app/scripts'))
});

gulp.task('default', ['gulp-reload', 'templates', 'js', 'fontawesome', 'fonts', 'less', 'connect', 'watch']);
gulp.task('dist', ['copy']);

gulp.task('cordova', function(){
  runSequence('copy-mock', 'copy-js', 'copy-css', 'copy-fonts', 'copy-images', 'copy-cordova', 'shell-build');
});
