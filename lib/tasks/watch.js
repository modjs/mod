var format = require('../utils/format');
var fs = require('fs');
var file = require('../utils/file');
var path = require('path');
var EventEmitter = require('events').EventEmitter;
var _ = require('underscore');

// In Nodejs 0.8.0, existsSync moved from path -> fs.
var existsSync = fs.existsSync || path.existsSync;

// Keep track of last modified times of files, in case files are reported to
// have changed incorrectly.
var mtimes = {};
var emitter = new EventEmitter;

exports.summary = 'Run predefined tasks whenever watched files change';

exports.usage = '[options]';

exports.options = {
    src : {
        alias : 's'
        ,describe : 'Files to be watched'
    },
    tasks : {
        alias : 't'
        ,describe : 'Tasks to run whenever files change'
    },
    whole : {
        alias: 'w'
        ,default: false
        ,describe: 'Run predefined tasks for whole files whatever watched files change'
    },
    debounce: {
        alias: 'd'
        ,default: 1000
        ,describe: 'Tasks debounce delay time'
    },
    verbose: {
        alias: 'v'
        ,default: true
        ,describe: 'Print watched files'
    }
};

exports.run = function (options) {
    var files = exports.files;
    // Convert string to array
    if(_.isString(options.tasks)){
        options.tasks = [options.tasks];
    }

    if(_.isEmpty(files)){
        files = getFilesWithTasks(options.tasks)
    }

    if(options.verbose){
        files.forEach(function(watchedFile){
            exports.log('Watching ' + path.relative(process.cwd(), watchedFile) + ' for changes' )
        })
    }
    options.files = files;
    return watch(options);
};

// src maybe option, pick it from task config
function getFilesWithTasks(tasks){
    var files = [];
    tasks.forEach(function(taskName){
        var options = exports.config(['tasks', taskName].join('.').replace(':', '.'));
        files = files.concat( file.expand( options ) );
    });

    return _.union(files);
}

function watch(options){
    exports.log("Waiting...");
    var targetFiles = options.files;
    var isWhole = options.whole;
    var debounceDelay = options.debounce;

    // An ID by which the setInterval can be canceled.
    var intervalId;
    // Files that are being watched.
    var watchedFiles = {};
    // File changes to be logged.
    var changedFiles = {};

    // Cleanup when files have changed. This is debounced to handle situations
    // where editors save multiple files "simultaneously" and should wait until
    // all the files are saved.
    var runner = _.debounce(function() {
        // Clear the files-added setInterval.
        clearInterval(intervalId);

        var fileArray = Object.keys(changedFiles);

        emitter.emit('changed', changedFiles);

        fileArray.forEach(function(filepath) {
            // Log which file has changed, and how.
            exports.log('File ' + filepath.cyan + ' ' + changedFiles[filepath]);
        });
        // Unwatch all watched files.
        Object.keys(watchedFiles).forEach(unWatchFile);

        var src = targetFiles;
        if(!isWhole){
            src = Object.keys(changedFiles);
        }

        var targets = options.tasks.map(function(name){
            return {
                name: name,
                options: {
                    src: src
                }
            }
        });

        try{
            exports.runTargets(targets, function(){
                exports.log('Completed at ' + (new Date()).toString().cyan);
                // Enqueue the watch task, so that it loops.
                watch(options);
            });
        }catch(e){
            exports.error(e);
        }

        // Continue task queue.

    }, debounceDelay);  // maybe 250 is short

    // Handle file changes.
    function fileChanged(status, filepath) {
        // TODO: It is not work right
        // If file was deleted and then re-added, consider it changed.
        if (changedFiles[filepath] === 'deleted' && status === 'added') {
            status = 'changed';
        }
        // Keep track of changed status for later.
        changedFiles[filepath] = status;
        // Execute debounced runner function.
        runner();
    }

    // Watch a file.
    function watchFile(filepath) {
        if (!watchedFiles[filepath]) {
            // Watch this file for changes. This probably won't scale to hundreds of
            // files.. but I bet someone will try it!

            ///console.log(filepath);

            watchedFiles[filepath] = fs.watch(filepath, function(event) {
                var mtime;
                // Has the file been deleted?
                var deleted = !existsSync(filepath);
                if (deleted) {
                    // If file was deleted, stop watching file.
                    unWatchFile(filepath);
                    // Remove from mtimes.nameArgs
                    delete mtimes[filepath];
                } else {
                    // Get last modified time of file.
                    mtime = +fs.statSync(filepath).mtime;
                    // If same as stored mtime, the file hasn't changed.
                    if (mtime === mtimes[filepath]) { return; }
                    // Otherwise it has, store mtime for later use.
                    mtimes[filepath] = mtime;
                }
                // Call "change" for this file, setting status appropriately (rename ->
                // renamed, change -> changed).
                fileChanged(deleted ? 'deleted' : event + 'd', filepath);
            });
        }
    }

    // Unwatch a file.
    function unWatchFile(filepath) {
        if (watchedFiles[filepath]) {
            // Close watcher.
            watchedFiles[filepath].close();
            // Remove from watched files.
            delete watchedFiles[filepath];
        }
    }

    // Watch all currently existing files for changes.
    targetFiles.forEach(watchFile);

    // Watch for files to be added.
    intervalId = setInterval(function() {
        // Files that have been added since last interval execution.
        var added = _.difference( targetFiles, Object.keys(watchedFiles));
        added.forEach(function(filepath) {
            // This file has been added.
            fileChanged('added', filepath);
            // Watch this file.
            watchFile(filepath);
        });
    }, 200);

    return emitter;
}
