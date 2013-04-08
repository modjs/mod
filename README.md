# Mod - Modern project management and comprehension tool for the web [![Build Status](https://secure.travis-ci.org/modulejs/modjs.png?branch=master)](http://travis-ci.org/modulejs/modjs)

![screenshot](https://raw.github.com/modulejs/modjs/master/example/screenshot.gif)

## What is Mod?

Mod is a task-based build tool, it help developers quickly build robust and high-performance web applications.

## Wiki
* [Project Roadmap](https://github.com/modulejs/modjs/wiki/Roadmap)
* [Mod Plugin List](https://github.com/modulejs/modjs/wiki/Plugins)
* [Real Modfile Example](https://github.com/modulejs/modulejs/blob/master/Modfile)

## Why another one?

* More built-in tasks
* More simplicity to use
* Configuration less, do more, even zero
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
* File watcher, trigger custom tasks
* Live Browser Reloads, instantly see changes in your browser
* Image Optimization, reduce JPEG, PNG and GIF file sizes
* Package manager: install, uninstall, update, search, ls
* Project boilerplate generate
* Built-in Web Server
* Github as one default public registry
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

mod install   # Install a package from the server-side package registry
mod uninstall # Uninstall the package
mod update    # Update a package to the latest version
mod ls        # List the packages currently installed
mod search    # Query the registry for matching package names
```

Some more examples of how to use our commands include:

```shell
# Package management
mod search jquery                 # Lookup jQuery in the Mod registry
mod install jquery@1.7.2          # Install a package and dependencies
mod update jquery                 # Update to latest version
mod uninstall jquery              # Uninstall jquery package
```

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
| Package manager          | ✓     | ✗         | ✓        |
| Private registry support | ✓     | ✗         | ✗        |
| Extensible plugins       | ✓     | ✓         | ✓        |
| Cross-platform           | ✓     | ✓         | ✗        |
```

## Package Defining

You can create a `package.json` file in your project's root,
for avoid conflict with NPM's 'dependencies', Mod use 'webDependencies' to specifying all of its dependencies.

```json
{
  "name": "myProject",
  "description": "myProject is myProject",
  "version": "0.0.1",
  "main": "./path/to/main.js",
  "webDependencies": {
    "jquery": "~1.8.2"
  }
}
```

Mod recognizes versions that follow the (semver)[http://semver.org/] specification.

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

![webqq](http://0.web.qstatic.com/webqqpic/pubapps/0/50/images/big.png)
![qqconnect](http://0.web.qstatic.com/webqqpic/pubapps/0/16/images/big.png)

## License

Mod is released under a [MIT](http://opensource.org/licenses/mit-license.php) license.
