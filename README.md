# Mod [![Build Status](https://secure.travis-ci.org/modulejs/modjs.png?branch=master)](http://travis-ci.org/modulejs/modjs)

## What is Mod?

Mod is a task-based build tool, it help developers quickly build beautiful web applications.

## Installation

Mod is installed using [Node](http://nodejs.org/) and [NPM](http://npmjs.org/)(Node Package Manager)

```shell
npm install -g modjs
```

## Built-in tasks

Mod supports a powerful set of high-level commands:

```shell
mod init      # Initialize and scaffold a new project
mod mini      # Minify js css html image files
mod lint      # Validate js css files
mod compile   # Build an optimized version of your app, ready to deploy
mod server    # Launch a preview server which will begin watching for changes

mod install   # Install a package from the client-side package registry
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

## Custom tasks

In addition to the built-in tasks, you can create your own tasks.

## Platform Support

Mod support Windows , OS X , Linux.


## Issue submission

Open a [new issue](https://github.com/modulejs/modjs/issues/new).


## About

Mod is an open-source project by [Tencent](http://tencent.com) which builds on top of [Node.js](https://nodejs.org).
We utilize a number of useful open-source solutions including:

* UglifyJS
* JSHint
* CleanCSS
* HTMLMinifiler
* CSSLint
* Seajs
* Requirejs
* Twitter Bootstrap
* HTML5 Boilerplate


## License

Mod is released under a [MIT](http://opensource.org/licenses/mit-license.php) license.
