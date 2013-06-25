# Mod - Modern project management and comprehension tool for the web [![Build Status](https://secure.travis-ci.org/modulejs/modjs.png?branch=master)](http://travis-ci.org/modulejs/modjs)

![screenshot](https://raw.github.com/modulejs/modjs/master/example/screenshot.gif)

## What is Mod?
Mod is a task-based workflow tooling for web, it help developers quickly build robust and high-performance web applications.

## Installation
[Mod](https://npmjs.org/package/modjs) is installed using [NPM(Node Package Manager)](http://npmjs.org/)

```sh
$ npm install modjs -g
```


## Tutorials
* [Getting Started](https://github.com/modulejs/modjs/tree/master/doc/tutorial/getting-started.md)
* [Configuring Tasks](https://github.com/modulejs/modjs/tree/master/doc/tutorial/configuring-task.md)
* [Creating Plugins](https://github.com/modulejs/modjs/tree/master/doc/tutorial/creating-plugins.md)

## Built-in Tasks
Mod supports a powerful set of high-level tasks:

* [help](https://github.com/modulejs/modjs/tree/master/doc/tasks/help.md) - get help on mod
* [min](https://github.com/modulejs/modjs/tree/master/doc/tasks/min.md) - minify JavaScript/CSS/HTML/Image source
* [lint](https://github.com/modulejs/modjs/tree/master/doc/tasks/lint.md) - validate JavaScript/CSS source
* [compile](https://github.com/modulejs/modjs/tree/master/doc/tasks/compile.md) - compile JavaScript/CSS/HTML source
* [create](https://github.com/modulejs/modjs/tree/master/doc/tasks/create.md) - generate project skeleton and create project directory
* [init](https://github.com/modulejs/modjs/tree/master/doc/tasks/init.md) - generate project skeleton from templates
* [server](https://github.com/modulejs/modjs/tree/master/doc/tasks/server.md) - start a static web server
* [pack](https://github.com/modulejs/modjs/tree/master/doc/tasks/pack.md) - create a tarball from a module
* [hash](https://github.com/modulejs/modjs/tree/master/doc/tasks/hash.md) - rename file with it hash value
* [build](https://github.com/modulejs/modjs/tree/master/doc/tasks/build.md) - build the project by convention
* [replace](https://github.com/modulejs/modjs/tree/master/doc/tasks/replace.md) - replace the contents of files
* [cat](https://github.com/modulejs/modjs/tree/master/doc/tasks/cat.md) - concatenate the content of files
* [cp](https://github.com/modulejs/modjs/tree/master/doc/tasks/cp.md) - copy one or more files to another location
* [mkdir](https://github.com/modulejs/modjs/tree/master/doc/tasks/mkdir.md) - create new folder
* [mv](https://github.com/modulejs/modjs/tree/master/doc/tasks/mv.md) - move or rename files or directories
* [rm](https://github.com/modulejs/modjs/tree/master/doc/tasks/rm.md) - remove files
* [strip](https://github.com/modulejs/modjs/tree/master/doc/tasks/strip.md) - source stripping

## API
* [exports.exports](https://github.com/modulejs/modjs/tree/master/doc/api/exports.md) - The exports API
* [exports.file](https://github.com/modulejs/modjs/tree/master/doc/api/file.md) - There are many provided methods for reading and writing files, traversing the filesystem and finding files by matching globbing patterns. Many of these methods are wrappers around built-in Node.js file functionality, but with additional error handling, logging and character encoding normalization.
* [exports.utils](https://github.com/modulejs/modjs/tree/master/doc/api/utils.md) - Miscellaneous utilities
* [exports._](http://underscorejs.org/) - Underscore provides 80-odd functions that support both the usual functional suspects: map, select, invoke — as well as more specialized helpers: function binding, javascript templating, deep equality testing, and so on. It delegates to built-in functions, if present, so modern browsers will use the native implementations of forEach, map, reduce, filter, every, some and indexOf.
* [exports.async](https://github.com/caolan/async) - Async provides around 20 functions that include the usual 'functional' suspects (map, reduce, filter, each…) as well as some common patterns for asynchronous control flow (parallel, series, waterfall…). All these functions assume you follow the node.js convention of providing a single callback as the last argument of your async function.
* [exports.request](https://github.com/mikeal/request) - Simplified HTTP request method
* [exports.prompt](https://github.com/flatiron/prompt) - Using prompt is relatively straight forward. There are two core methods you should be aware of: prompt.get() and prompt.addProperties(). There methods take strings representing property names in addition to objects for complex property validation (and more).

## Wiki
* [Project Roadmap](https://github.com/modulejs/modjs/wiki/Roadmap)
* [Mod Plugin List](https://github.com/modulejs/modjs/wiki/Plugins)
* [Modfile Example](https://github.com/modulejs/modjs/blob/master/example/Modfile)

## Quick Build Demo
* [RequireJS Project Build](https://github.com/modulejs/modjs/tree/master/test/buildrequirejs)
* [SeaJS Project Build](https://github.com/modulejs/modjs/tree/master/test/buildseajs)

## IDE Support
* [Sublime-Mod](https://github.com/yuanyan/sublime-mod)

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

## Simple Examples
* [Concatenate JS Files](https://github.com/modulejs/modjs/tree/master/test/catjs)
* [Concatenate CSS Files](https://github.com/modulejs/modjs/tree/master/test/catcss)
* [CMD Modules Compile](https://github.com/modulejs/modjs/tree/master/test/compilecmd)
* [CSS Modules Compile](https://github.com/modulejs/modjs/tree/master/test/compilecss)
* [HTML Precompile](https://github.com/modulejs/modjs/tree/master/test/compilehtml)
* [JPG Image Compression](https://github.com/modulejs/modjs/tree/master/test/minjpg)
* [PNG Image Compression](https://github.com/modulejs/modjs/tree/master/test/minpng)
* [JS Minify](https://github.com/modulejs/modjs/tree/master/test/minjs)
* [CSS Minify](https://github.com/modulejs/modjs/tree/master/test/mincss)
* [Source Stripping](https://github.com/modulejs/modjs/tree/master/test/strip)
* [Inline Images DataURI](https://github.com/modulejs/modjs/tree/master/test/datauri)
* [Plugin: CSS Images Sprites](https://github.com/modulejs/modjs/tree/master/test/plugintask)
* [Custom: Hello ModJS](https://github.com/modulejs/modjs/tree/master/test/customtask)

## Modfile
Like Makefile/Rakefile, Modfile is implemented as a NodeJS module：

```js
module.exports = {
    plugins: {
        sprite: "mod-sprite"
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
$ mod dist
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
* RequireJS
* SeaJS
* OptiPNG
* JPEGtran

## Used by people within <a href="https://github.com/modulejs/modjs/issues/22">(JOIN US)</a>
![qqfind](http://0.web.qstatic.com/webqqpic/pubapps/0/50/images/big.png)
![qqconnect](http://0.web.qstatic.com/webqqpic/pubapps/0/16/images/big.png)


## License
Mod is released under a [MIT](http://opensource.org/licenses/mit-license.php) license.
