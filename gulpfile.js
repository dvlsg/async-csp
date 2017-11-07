const babel = require('gulp-babel')
const del = require('del')
const gulp = require('gulp')
const plumber = require('gulp-plumber')
const rename = require('gulp-rename')
const sequence = require('run-sequence')
const uglify = require('gulp-uglify')
const webpack = require('webpack-stream')
const sourcemaps = require('gulp-sourcemaps')

const srcDir = './src'
const srcGlob = `${srcDir}/*.js`
const srcEntry = `channel.js`
const distDir = './dist'
const distUmdDir = `${distDir}/umd`
const distCjsDir = `${distDir}/cjs`
const singleFilename = 'async-csp.js'
const libraryName = 'async-csp'

function transpileUmd(config) {
  if (config === undefined) {
    config = {
      output: {
        filename: singleFilename,
        library: libraryName,
        libraryTarget: 'umd',
      },
      module: {
        loaders: [
          { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
        ],
      },
    }
  }
  return webpack(config)
}

gulp.task('clean', done => {
  return del([distDir], done)
})

gulp.task('build:umd', () => {
  return gulp
    .src(`${srcDir}/${srcEntry}`)
    .pipe(transpileUmd())
    .pipe(sourcemaps.init())
    .pipe(gulp.dest(distUmdDir))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(distUmdDir))
})

gulp.task('build:cjs', () => {
  return gulp
    .src(srcGlob)
    .pipe(plumber())
    .pipe(babel()) // config in .babelrc
    .pipe(plumber.stop())
    .pipe(gulp.dest(distCjsDir))
})

gulp.task('build', done => {
  sequence(['build:cjs', 'build:umd'], done)
})

gulp.task('default', done => {
  sequence('test', 'clean', 'lint', 'build', 'watch', done)
})
