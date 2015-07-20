var gulp     = require('gulp');
var mocha    = require('gulp-mocha');
var eslint   = require('gulp-eslint');
var plumber  = require('gulp-plumber');
var babel    = require('gulp-babel');
var del      = require('del');
var sequence = require('run-sequence');

require('babel-core/register'); // for mocha tests

var srcDir = './src/';
var srcGlob = srcDir + '*.js';

var distDir = './dist/';
var distGlob = distDir + '*.js';

var testDir = './test/';
var testGlob = testDir + '*.spec.js';

gulp.task('lint', function() {
    return gulp.src(srcGlob)
        .pipe(eslint()) // config in .eslintrc
        .pipe(eslint.format())
});

gulp.task('test', function() {
    return gulp.src(testGlob)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(mocha({ reporter: 'spec' }));
});

gulp.task('clean', function(done) {
    return del([distDir], done);
});

gulp.task('build', function() {
    return gulp.src(srcGlob)
        .pipe(plumber())
        .pipe(babel()) // config in .babelrc
        .pipe(plumber.stop())
        .pipe(gulp.dest(distDir))
});

gulp.task('watch', function() {
    gulp.watch(srcGlob, function() {
        sequence(
            'lint',
            'build'
        );
    });
    gulp.watch(testGlob, ['test']);
});

gulp.task('default', function(done) {
    sequence(
        'test',
        'clean',
        'lint',
        'build',
        'watch',
        done
    );
});
