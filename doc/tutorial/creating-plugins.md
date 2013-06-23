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

## Options

```
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
```

## Done callback

General task is asynchronous, how mod know task is run over? We use done callback.
When a asynchronous task is over, call the `done()` method.

```js
exports.run = function (options, done) {
    exec(function(){
        // balabal...
        done();
    });
};
```

If task is a synchronous, the done callback is optional:
```js
exports.run = function (options) {
    console.log('run done');
};
```

## Plugin API

Mod plugin API are provided directly on the `exports` object for convenience. See the individual api section docs for detailed explanations and examples.

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
