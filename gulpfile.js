const gulp = require('gulp')
const browserify = require('gulp-browserify')
const babel = require('gulp-babel')

// Basic usage
gulp.task('scripts', function () {
  // Single entry point to browserify
  return gulp.src('public/javascripts/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(browserify({
      insertGlobals: true,
      debug: !gulp.env.production
    }))
    .pipe(gulp.dest('public/javascripts/dest'))
})

gulp.task('scripts:watch', function () {
  return gulp.watch('public/javascripts/**/*.js')
})
