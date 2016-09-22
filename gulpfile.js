const gulp = require('gulp')
const fs = require('fs')
const browserify = require('browserify')

gulp.task('scripts', function () {
  browserify({ entries: './public/javascripts/main.js', debug: true })
    .transform('babelify', {presets: ['es2015']})
    .bundle()
    .pipe(fs.createWriteStream('./public/javascripts/bundle.js'))
})

gulp.task('scripts:watch', function () {
  return gulp.watch(['./public/javascripts/**/*.js', '!./public/javascripts/bundle.js'], ['scripts'])
})
