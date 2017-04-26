const gulp = require('gulp')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const cleanCSS = require('gulp-clean-css')
const del = require('del')

gulp.task('clean', function (done) {
  del.sync(['logs', 'public/index.html', 'public/js', 'public/css'])
  done()
})

gulp.task('js', function (done) {
  return gulp.src([
    'node_modules/codemirror/lib/codemirror.js',
    'node_modules/codemirror/mode/javascript/javascript.js',
    'node_modules/codemirror/addon/hint/show-hint.js'])
    .pipe(concat('codemirror.js'))
    .pipe(uglify())
    .pipe(gulp.dest('public/js'))
    .on('finish', done)
})

gulp.task('css', function (done) {
  return gulp.src([
    'node_modules/codemirror/lib/codemirror.css',
    'node_modules/codemirror/addon/hint/show-hint.css',
    'node_modules/codemirror/theme/dracula.css'])
    .pipe(concat('codemirror.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest('public/css'))
    .on('finish', done)
})

gulp.task('init', gulp.parallel('clean', 'js', 'css'))
