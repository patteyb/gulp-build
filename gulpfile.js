"use strict";

var gulp    = require('gulp'),
  imagemin  = require('gulp-imagemin'),
   flatten  = require('gulp-flatten'),
     uglify = require('gulp-uglify'),
     eslint = require('gulp-eslint'),
     concat = require('gulp-concat'),
     rename = require('gulp-rename'),
     useref = require('gulp-useref'),
       sass = require('gulp-sass'),
       maps = require('gulp-sourcemaps'),
        del = require('del'),
        iff = require('gulp-if'),
       csso = require('gulp-csso');

     var paths = {
       scripts: './js/**/*',
       sass: 'sass/**/*.scss',
       html: 'index.html',
       images: './images/**/*',
       icons: '/icons/**',
       css: '/css/*.css'
     };

     var dist = {
       base: 'dist',
       styles: './dist/styles',
       scripts: './dist/scripts',
       icons: './dist/icons',
       content: './dist/content'
     };

/** CLEAN TASKS ------------------------  */
/** Delete the dist directory, js files, and css directory */
gulp.task('clean', function() {
  return del.sync(['./dist', 'js/*.*', 'css/']);
});

/** Delete directories made when compiling and minifying styles */
gulp.task('cleanStyles', function() {
  return del.sync([dist.styles, 'css']);
});

/** Delete directories made when concatenating and minifying scripts */
gulp.task('cleanScripts', function() {
  return del.sync(['js/*.*', dist.scripts]);
});

/** STYLE MANIPULATION ------------------  */
/** Compile sass files and make sourcemaps */
gulp.task('compileSass', function() {
  gulp.src(paths.sass)
      .pipe(maps.init())
      .pipe(sass())
      .pipe(maps.write('./'))
      .pipe(flatten())
      .pipe(gulp.dest('css'));
  return del.sync('css/circle');
});

/** Minify styles and store in final destination */
gulp.task('styles', ['compileSass'], function() {
    //return gulp.src(dist.styles + '/*.css')   
    return gulp.src(paths.css)                       
      .pipe(csso())
      .pipe(rename('all.min.css'))
      .pipe(gulp.dest(dist.styles));
});

/** SCRIPT MANIPULATION ---------------  */
/** Error checking js files */
gulp.task('lint', function() {
  return gulp.src(['**/*.js', '!node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

/** Combine js files and make sourcemaps */
gulp.task('concatScripts', ['lint'], function() {
  return gulp.src(paths.scripts)
      .pipe(maps.init())
      .pipe(concat('global.js'))
      .pipe(maps.write('./'))
      .pipe(gulp.dest('js'));
});

/** Minify script files and store in final destination */
gulp.task('scripts', ['concatScripts'], function() {
  return gulp.src('./js/*.js')                          
    .pipe(uglify())
    .pipe(rename('all.min.js'))
    .pipe(gulp.dest(dist.scripts));
});

/** IMAGE MANIPULATION -------------------  */
/** Optimize images and output them in dist */
gulp.task('images', function() {
  return gulp.src(paths.images)
    .pipe(imagemin())
    .pipe(gulp.dest(dist.content));
});

/** BUILD TASKS ------------------------  */
gulp.task('prebuild', ['clean', 'images'], function() {
    return gulp.src(["icons/**"], { base: './'})
        .pipe(gulp.dest('dist')); 
});

gulp.task('build', ['prebuild', 'compileSass', 'concatScripts'], function() {
    gulp.src('./*.html')
        .pipe(useref())
        .pipe(iff('*.js', uglify()))         
        .pipe(iff('*.css', csso()))
        .pipe(gulp.dest('./dist')); 
});

gulp.task('watchFiles', function() {
    // pass it the files you want to watch and then the task that should take place
    // when a file changes
    // Each watch block is independent of each other and will only run a block
    // when a file in that block changes
    gulp.watch('sass/**/*.scss', ['styles']); // scss/**/*.scss -- this is a globbing pattern
    gulp.watch('js/**/*.js', ['scripts']);
});

/** SERVE TASK -----------------------  */
gulp.task('serve', ['build', 'watchFiles']);

/** DEFAULT TASKS --------------------  */
gulp.task("default", function() {
  gulp.start('build');
});
