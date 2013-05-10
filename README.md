# Mod - Modern project management and comprehension tool for the web [![Build Status](https://secure.travis-ci.org/modulejs/modjs.png?branch=master)](http://travis-ci.org/modulejs/modjs)

![screenshot](https://raw.github.com/modulejs/modjs/master/example/screenshot.gif)

## What is Mod?

Mod is a task-based build tool for the web, it help developers quickly build robust and high-performance web applications.

## Wiki
* [Project Roadmap](https://github.com/modulejs/modjs/wiki/Roadmap)
* [Mod Plugin List](https://github.com/modulejs/modjs/wiki/Plugins)
* [QQ Find Modfile Example](https://github.com/modulejs/modjs/blob/master/example/Modfile)

## Why another one?

* More built-in tasks
* More simplicity to use
* Configuration less(even zero), do more
* Business background, community support

## Features

* Task-based builds
* Minify everything: JS, CSS, HTML, Images
* Source linting: JS, CSS
* Modular JS for the web: AMD, CMD(will support CommonJS soon)
* CSS import file combination
* HTML conditional comments for target build
* Source stripping, automatically remove debugging code
* Common action: cat, rm, mv, mkdir, cp, hash, pack
* File watcher, trigger custom tasks when file change
* Live Browser Reloads, instantly see changes in your browser
* Image Optimization, reduce JPEG, PNG and GIF file sizes
* Project boilerplate generate
* Built-in Web Server
* Extensible, easily write plugins
* Works on most platforms: Windows, Linux, Mac OS X, Unix...

## Npm Installation

Mod is installed using [NPM(Node Package Manager)](http://npmjs.org/)

```shell
npm install -g modjs
```

## Built-in Tasks

Mod supports a powerful set of high-level commands:

```shell
                          __   _
   ____ ___   ____   ____/ /  (_)_____
  / __ `__ \ / __ \ / __  /  / // ___/
 / / / / / // /_/ // /_/ /  / /(__  )
/_/ /_/ /_/ \____/ \__,_/__/ //____/
                        /___/

Usage: mod COMMAND [ARGS]

mod cat       # Concatenate the content of files
mod cp        # Copy one or more files to another location
mod mkdir     # Create new folder
mod mv        # Move or rename files or directories
mod rm        # Remove files
mod strip     # Source stripping

mod min       # Minify js css html image files
mod lint      # Validate js css files
mod build     # Build an optimized version of your app, ready to deploy

mod create    # Generate a project skeleton include project directory
mod init      # Generate a project skeleton in target directory
mod server    # Start a static web server
mod pack      # Create a tarball with target directory
mod hash      # Rename file with it hash value
mod search    # Search the Github
```

## Simple Examples
* [Concatenate Files](https://github.com/modulejs/modjs/tree/master/test/cat)
* [CMD Modules Compile](https://github.com/modulejs/modjs/tree/master/test/compilecmd)
* [CSS Modules Compile](https://github.com/modulejs/modjs/tree/master/test/compilecss)
* [JPG Image Compression](https://github.com/modulejs/modjs/tree/master/test/minjpg)
* [PNG Image Compression](https://github.com/modulejs/modjs/tree/master/test/minpng)
* [JS Minify](https://github.com/modulejs/modjs/tree/master/test/minjs)
* [CSS Minify](https://github.com/modulejs/modjs/tree/master/test/mincss)
* [Source Stripping](https://github.com/modulejs/modjs/tree/master/test/strip)
* [Inline Images DataURI](https://github.com/modulejs/modjs/tree/master/test/datauri)
* [CSS Images Sprites](https://github.com/modulejs/modjs/tree/master/test/sprite)

## Modfile

Like Makefile/Rakefile, Modfile is implemented as a NodeJS module：

```js
module.exports = {
    plugins: {
        sprite: "mod-sprite",
        datauri: "mod-datauri"
    },

    tasks: {
        "rm" : {
            "target": "./dist"
        },
        "min" : {
            "img": {
                "source": "./img/*.png",
                "dest": "./dist/img"
            },
            "css": {
                "source": "./dist/css/*.css",
                "dest": "./dist/css"
            },
            "html": {
                "source": "*.html",
                "dest": "./dist/"
            },
            "js": {
                "source": "./dist/js/*.js",
                "dest": "./dist/js"
            }
        },
        "cat": {
            "source":["./dist/js/a.js","./dist/js/b.js"],
            "dest":  "./dist/js/ab.js"
        },

        "watch" : {
            "source": ["*"],
            "tasks": ""
        },
    },

    targets: {
        dist: "rm min cat"
    }
};
```

Then run 'dist' target:

```sh
mod dist
```

## Compression Table

```sh
| Feature                  | Mod    | Grunt      | Yeoman    |
|--------------------------+--------+------------+-----------|
| Minifier                 | ✓     | ✓         | ✓        |
| Linter                   | ✓     | ✓         | ✓        |
| HTML Conditional Comments| ✓     | ✗         | ✗        |
| CSS Combination          | ✓     | ✗         | ✗        |
| Image Optimization       | ✓     | ✗         | ✓        |
| Source stripper          | ✓     | ✗         | ✗        |
| Modular JS               | ✓     | ✗         | ✗        |
| File Watcher             | ✓     | ✓         | ✓        |
| Live Browser Reloads     | ✓     | ✗         | ✓        |
| Built-in WebServer       | ✓     | ✓         | ✓        |
| Skeletons (Boilerplates) | ✓     | ✓         | ✓        |
| Headless browser Testing | ✗     | ✓         | ✓        |
| Extensible plugins       | ✓     | ✓         | ✓        |
| Cross-platform           | ✓     | ✓         | ✗        |
```

## Custom Tasks

In addition to the built-in tasks, you can create your own tasks:

### Plugin Example
```js
exports.summary = 'my task';

exports.usage = '<source> [options]';

exports.options = {
    "d" : {
        alias : 'dest'
        ,default : '<source>'
        ,describe : 'destination file'
    },

    "c" : {
        alias : 'charset'
        ,default : 'utf-8'
        ,describe : 'file encoding type'
    }
};

exports.run = function (options, callback) {
    var target = options.target;
    // ...
};
```

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

## Platform Support

Mod support Windows, OS X, Linux.


## Issue Submission

Submit a [new issue](https://github.com/modulejs/modjs/issues/new).

## About

Mod is an open-source project by [Tencent](http://www.tencent.com/en-us/) which builds on top of [Node.js](https://nodejs.org).
We utilize a number of useful open-source solutions including:

* UglifyJS
* JSHint
* CleanCSS
* CSSLint
* HTMLMinifiler
* Requirejs
* Twitter Bootstrap
* HTML5 Boilerplate

## Used by people within

![qqfind](http://0.web.qstatic.com/webqqpic/pubapps/0/50/images/big.png)
![qqconnect](http://0.web.qstatic.com/webqqpic/pubapps/0/16/images/big.png)

## License

Mod is released under a [MIT](http://opensource.org/licenses/mit-license.php) license.
