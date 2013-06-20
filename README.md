# Mod - Modern project management and comprehension tool for the web [![Build Status](https://secure.travis-ci.org/modulejs/modjs.png?branch=master)](http://travis-ci.org/modulejs/modjs)

![screenshot](https://raw.github.com/modulejs/modjs/master/example/screenshot.gif)

## What is Mod?

Mod is a task-based workflow tooling for web, it help developers quickly build robust and high-performance web applications.

## Installation

[Mod](https://npmjs.org/package/modjs) is installed using [NPM(Node Package Manager)](http://npmjs.org/)

```sh
$ npm install -g modjs
```

## Wiki
* [Project Roadmap](https://github.com/modulejs/modjs/wiki/Roadmap)
* [Mod Plugin List](https://github.com/modulejs/modjs/wiki/Plugins)
* [QQ Find Modfile Example](https://github.com/modulejs/modjs/blob/master/example/Modfile)

## Quick Build Demo
* [RequireJS Project Build](https://github.com/modulejs/modjs/tree/master/test/buildrequirejs)
* [SeaJS Project Build](https://github.com/modulejs/modjs/tree/master/test/buildseajs)

## IDE Support
* [sublime-mod](https://github.com/yuanyan/sublime-mod)

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

## Built-in Tasks
Mod supports a powerful set of high-level commands:

* [help](https://github.com/modulejs/modjs/tree/master/doc/tasks/help.md) - Get help on mod
* [min](https://github.com/modulejs/modjs/tree/master/doc/tasks/min.md) - Minify JavaScript/CSS/HTML/Image source
* [lint](https://github.com/modulejs/modjs/tree/master/doc/tasks/lint.md) - Validate JavaScript/CSS source
* [compile](https://github.com/modulejs/modjs/tree/master/doc/tasks/compile.md) - Compile JavaScript/CSS/HTML source
* [create](https://github.com/modulejs/modjs/tree/master/doc/tasks/create.md) - Generate a project skeleton include project directory
* [init](https://github.com/modulejs/modjs/tree/master/doc/tasks/init.md) - Generate a project skeleton in target directory
* [server](https://github.com/modulejs/modjs/tree/master/doc/tasks/server.md) - Start a static web server
* [pack](https://github.com/modulejs/modjs/tree/master/doc/tasks/pack.md) - Create a tarball from a module
* [hash](https://github.com/modulejs/modjs/tree/master/doc/tasks/hash.md) - Rename file with it hash value
* [build](https://github.com/modulejs/modjs/tree/master/doc/tasks/build.md) - Build the project by convention
* [replace](https://github.com/modulejs/modjs/tree/master/doc/tasks/replace.md) - Replace the contents of files
* [cat](https://github.com/modulejs/modjs/tree/master/doc/tasks/cat.md) - Concatenate the content of files
* [cp](https://github.com/modulejs/modjs/tree/master/doc/tasks/cp.md) - Copy one or more files to another location
* [mkdir](https://github.com/modulejs/modjs/tree/master/doc/tasks/mkdir.md) - Create new folder
* [mv](https://github.com/modulejs/modjs/tree/master/doc/tasks/mv.md) - Move or rename files or directories
* [rm](https://github.com/modulejs/modjs/tree/master/doc/tasks/rm.md) - Remove files
* [strip](https://github.com/modulejs/modjs/tree/master/doc/tasks/strip.md) - Source stripping


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

## Used by people within

![qqfind](http://0.web.qstatic.com/webqqpic/pubapps/0/50/images/big.png)
![qqconnect](http://0.web.qstatic.com/webqqpic/pubapps/0/16/images/big.png)

[Tell us you use modjs!](https://github.com/modulejs/modjs/issues/22)

## License

Mod is released under a [MIT](http://opensource.org/licenses/mit-license.php) license.
