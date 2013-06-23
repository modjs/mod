Tasks are mod's bread and butter. The stuff you do most often, like `min` or `cat`. Every time Mod is run, you specify one or more tasks to run, which tells Mod what you'd like it to do.

In addition to the built-in tasks, you can create your own task:

## Plugin skeleton
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

exports.run = function (options, done) {
    var target = options.target;
    // ...
    done();
};
```

## Plugin API
```js
exports.taskName
exports.files
exports.loadTask()
exports.runTask()
exports.config()

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


## Plugin publish
1. Author project's `package.json`.
1. Run `npm publish` to publish the mod plugin to npm
