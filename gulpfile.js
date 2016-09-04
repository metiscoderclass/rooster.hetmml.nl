const gulp = require('gulp')
const browserify = require('gulp-browserify')

// Basic usage
gulp.task('scripts', function () {
  // Single entry point to browserify
  gulp.src('public/javascripts/main.js')
    .pipe(browserify({
      insertGlobals: true,
      debug: !gulp.env.production
    }))
    .pipe(gulp.dest('public/javascripts/bundle.js'))
})

gulp.task('scripts:watch', function () {
  return gulp.watch('public/javascripts/**/*.js')
})
