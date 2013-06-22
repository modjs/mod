/**
 * Thanks to Ben Alman's work on grunt on which this file is based.
 * http://gruntjs.com/
 */

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

// TODO
exports.run = function (options, callback) {

    // Build an array of source/tasks objects.
    //    {
    //        "less": {
    //            "source": "less/*.less",
    //             "tasks": "less"
    //        }
    //
    //        ,"coffee":{
    //            "source": ["coffee/*.coffee","js/*.coffee"],
    //            "tasks": "coffee"
    //        }
    //    }

    // return ["less", "coffee"]
    var targets = Object.keys(options).filter(function(key) {
        return typeof options[key] !== 'string' && !Array.isArray(options[key]);
    });

    targets = targets.map(function(target){
        return options[target];
    });

    // Allow "basic" non-target format.
    //     {
    //        "source": "less/*.less",
    //        "tasks": "less"
    //     }
    if (typeof options.source === 'string' || Array.isArray(options.source)) {
        targets.push({source: options.source, tasks: options.tasks});
    }

    watch(targets, callback);
};

function watch(targets, callback){

    // Get a list of files to be watched.
    var patterns = _.chain(targets).pluck('source').flatten().uniq().value();
    var targetFiles = file.glob(patterns);

    // An ID by which the setInterval can be canceled.
    var intervalId;
    // Files that are being watched.
    var watchedFiles = {};
    // File changes to be logged.
    var changedFiles = {};

    // Cleanup when files have changed. This is debounced to handle situations
    // where editors save multiple files "simultaneously" and should wait until
    // all the files are saved.
    var done = _.debounce(function() {
        // Clear the files-added setInterval.
        clearInterval(intervalId);

        var fileArray = Object.keys(changedFiles);

        emitter.emit('changed', changedFiles);

        fileArray.forEach(function(filepath) {
            // Log which file has changed, and how.
            exports.log('File "' + filepath + '" ' + changedFiles[filepath] + '.');
        });
        // Unwatch all watched files.
        Object.keys(watchedFiles).forEach(unWatchFile);

        // For each specified target, test to see if any files matching that
        // target's file patterns were modified.
        targets.forEach(function(target) {

            var files = file.glob(target.source);
            var intersection = _.intersection(fileArray, files);
            // Enqueue specified tasks if a matching file was found.
            if (intersection.length > 0 && target.tasks) {
                exports.runTargets(target.tasks); // TODO
            }
        });
        // Enqueue the watch task, so that it loops.
        watch(targets);
        // Continue task queue.

    }, 250);

    // Handle file changes.
    function fileChanged(status, filepath) {
        // If file was deleted and then re-added, consider it changed.
        if (changedFiles[filepath] === 'deleted' && status === 'added') {
            status = 'changed';
        }
        // Keep track of changed status for later.
        changedFiles[filepath] = status;
        // Execute debounced done function.
        done();
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


    callback && callback(null, emitter);

}
