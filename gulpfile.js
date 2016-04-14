

'use strict';

var spawn = require('child_process').spawn;
var electron = require('electron-prebuilt');
var gulp = require('gulp');
var jetpack = require('fs-jetpack');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var os = require('os');
var release_windows = require('./buil.windows');
var zip = require('gulp-vinyl-zip');
var electron = require('gulp-atom-electron');
var projectDir = jetpack;
var srcDir = projectDir.cwd('./app');
var destDir = projectDir.cwd('./build');
var rimraf = require('gulp-rimraf');

// -------------------------------------
// Tasks
// -------------------------------------

gulp.task('clean', function (callback) {
   destDir.dirAsync('.', { empty: true });
    return gulp.src('*.zip', { read: false }) // much faster 
   .pipe(rimraf());
});

gulp.task('copy', ['clean'], function () {
    return projectDir.copyAsync('app', destDir.path(), {
        overwrite: true,
        matching: [
            './node_modules/**/*',
            '*.html',
            '*.css',
            '*.svg',
            'main.js',
            'package.json'
        ]
    });
});

gulp.task('build', ['copy'], function () {
    return gulp.src('./app/index.html')
        .pipe(usemin({
            js: [uglify()]
        }))
        .pipe(gulp.dest('build/'));
});

//todo figure out why wrapping this child_process in a gulp task causes spawn to throw  TypeError: Bad argument
gulp.task('run', function () {
    spawn(electron, ['./app'], { stdio: 'inherit' });
});

gulp.task('build-osx', ['build'], function () {
    return gulp.src('build/**')
        .pipe(electron({
            version: '0.36.7',
            platform: 'darwin',
            darwinIcon: './resources/darwin/allied.icns',
        }))
        .pipe(zip.dest('IPay_Test_OSX.zip'));
});

gulp.task('build-linux', ['build'], function () {
    return gulp.src('build/**')
        .pipe(electron({ name: 'IPay Test UI', version: '0.36.7', platform: 'linux' }))
        .pipe(zip.dest('IPay_Test_NIX.zip'));
});

gulp.task('build-win32', ['build'], function () {
    return gulp.src('build/**')
        .pipe(electron({
            name: 'IPay Test UI',
            version: '0.36.7',
            platform: 'win32',
            winIcon: './resources/windows/allied.ico',
            companyName: 'Allied Payment',
        }))
        .pipe(zip.dest('IPay_Test_WIN.zip'));
});


gulp.task('release', ['build-win32','build-osx','build-linux']);