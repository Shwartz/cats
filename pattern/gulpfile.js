const gulp = require('gulp'),
    rollup = require('rollup-stream'),
    source = require('vinyl-source-stream'),
    del = require('del'),
    watch = require('gulp-watch'),
    includePaths = require('rollup-plugin-includepaths'),
    forceBinding = require('rollup-plugin-force-binding'),
    path = require('path'),
    babili = require("gulp-babili");

gulp.task('clean', () => {
    return del([
        './dist'
    ]);
});

gulp.task('main', ['service-worker'], () => {
    return rollup({
        entry:      './src/main.js',
        format:     'iife',
        moduleName: 'utils'
    }).pipe(source('main.js'))
        .pipe(gulp.dest('./dist'));
});


gulp.task('service-worker', ['clean'], () => {
    return rollup({
        entry:      './src/service-worker.js',
        format:     'iife',
        moduleName: 'utils',
        plugins:    [
            forceBinding([
                './node_modules/functional_tasks/src/functional/core/Task',
                'Task'
            ]),
            includePaths({
                include:    {
                    // Import example: import angular from 'angular';
                    'functional/core/Task':   './node_modules/functional_tasks/src/functional/core/Task',
                    'functional/async/Fetch': './node_modules/functional_tasks/src/functional/async/Fetch'
                },
                extensions: ['.js']
            })
        ],

    }).pipe(source('service-worker.js'))
        .pipe(gulp.dest('./'));
});


gulp.task('default', ['main']);

