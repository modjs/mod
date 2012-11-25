# Mod - Modern build tool for web[![Build Status](https://secure.travis-ci.org/modulejs/modjs.png?branch=master)](http://travis-ci.org/modulejs/modjs)

## What is Mod?

Mod is a task-based build tool, it help developers quickly build beautiful web applications.

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
mod fmt       # Formatting tools.

mod min       # Minify js css html image files
mod lint      # Validate js css files
mod build     # Build an optimized version of your app, ready to deploy

mod create    # Generate a project skeleton include project directory
mod init      # Generate a project skeleton in target directory
mod server    # Start a static web server
mod pack      # Create a tarball from a module
mod hash      # Rename file with it hash value

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

## Custom Tasks

In addition to the built-in tasks, you can create your own tasks.

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
* Seajs
* Requirejs
* Twitter Bootstrap
* HTML5 Boilerplate


## License

Mod is released under a [MIT](http://opensource.org/licenses/mit-license.php) license.
