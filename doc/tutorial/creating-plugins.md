Tasks are mod's bread and butter. The stuff you do most often, like `min` or `c`. Every time Mod is run, you specify one or more tasks to run, which tells Mod what you'd like it to do.

### Plugin skeleton
```js
exports.summary = 'my task';

exports.usage = '<source> [options]';

exports.options = {
    "dest" : {
        alias : 'd'
        ,default : '<source>'
        ,describe : 'destination file'
    },

    "charset" : {
        alias : 'c'
        ,default : 'utf-8'
        ,describe : 'file encoding type'
    }
};

exports.run = function (options, callback) {
    var target = options.target;
    // ...
};

### Plugin API
```js
exports.taskName
exports.loadTask()
exports.runTask()

exports.getArgs()
exports.getConfig()
exports.getTaskConfig()

exports.log()
exports.error()
exports.warn()
exports.debug()

exports.file
exports.utils

exports._
exports.async
exports.request
exports.prompt
```