# Getting started

Mod and mod plugins are installed and managed via [npm](https://npmjs.org/), the [Node.js](http://nodejs.org/) package manager.

_Mod 0.4.x requires Node.js version `>= 0.8.0`._

## Installing

In order to get started, you'll want to install Mod globally.  You may need to use sudo (for OSX, *nix, BSD etc) or run your command shell as Administrator (for Windows) to do this.

```shell
npm install -g modjs
```

This will put the `mod` command in your system path, allowing it to be run from any directory.

## How mod works

Each time `mod` is run, it looks for `Modfile` deeply. Because of this, you can run `mod` from any subfolder in your project.

If a `Modfile` is found, mod applies the configuration from your `Modfile`, and if there is a configuration of plugins, mod will automatically install the uninstlled plugins, if a plugin is your own custom task, mod load it by node's `require()` system, then executes any tasks you've requested for it to run.

If you don't specify a target or task, but the only defined target or task will run by default.

Installed Mod tasks can be listed by running `mod --help` but it's usually a good idea to start with the project's documentation.

## Preparing a new mod project
A typical setup will involve adding only one file to your project: `Modfile`.

**Modfile**: This file used to configure tasks and plugins.

## The Modfile
The `Modfile` or `Modfile.js` file is a valid JavaScript file that belongs in the root directory of your project.

A Modfile is comprised of the following parts:

* The "runner" object
* The plugins configuration
* The tasks configuration
* The targets configuration

### An example Modfile
In the following Modfile, the [mod-sprite] plugin's `sprite` task is configured to generate css sprite. When mod is run on the command line, the `sprite` task will be run by default.

```js
module.exports = {
    // Load the plugin that provides the "sprite" task.
    plugins: {
        sprite: "mod-sprite"
    },

    // Project configuration.
    tasks: {
        sprite: {
            "src": "./css/find.css",                 // required
            "dest": "./dist/css/find.css",              // required
            "destImageRoot": "./sprites/",              // optional relative to  dest path, default "./sprites/"
            "maxSize": 60,                              // optional "kb"
            "margin": 5,                                // optional default 0
            "prefix": "sprite_",                        // optional
            "igts": true                                // optional
        },
        "min" : {
            "css": {
                "src": "./dist/css/*.css",
                "dest": "./dist/css"
            },
            "html": {
                "src": "*.html",
                "dest": "./dist/"
            },
            "js": {
                "src": "./dist/js/*.js",
                "dest": "./dist/js"
            }
        }
    },

    // Target task(s).
    targets: {
        dist: "sprite min"
    }
};
```

It's so easy to start working with Mod. Because `Modfile` is a JavaScript file, you're not limited to JSON, can use any valid JS here. You can even programmatically generate the configuration if necessary.

Now that you've seen the whole Modfile, let's look at its component parts.


### Plugins configuration

```js
module.exports = {
    plugins: {
        // Plugin task
        sprite: "mod-sprite",
        // Custom task
        mytask: "./tasks/mytask"
    }
}
```

### Tasks configuration

```js
module.exports = {
    tasks: {
        pkg: {
            name: "foo"
        },
        min: {
            source: 'src/{{pkg.name}}.js',
            dest: 'build/{{pkg.name}}.min.js'
        }
    }

};
```

### Targets configuration

```js
module.exports = {
    targets: {
        dev:  "cat min:js",
        dist: "sprite min"
    }
};
```


## Further Reading

* The [Configuring Tasks](https://github.com/modjs/mod/blob/master/doc/tutorial/configuring-tasks.md) guide has an in-depth explanation on how to configure tasks, targets, options and files inside the Modfile, along with an explanation of templates, globbing patterns.
* For more information about writing [custom tasks or Mod plugins](https://github.com/modjs/mod/blob/master/doc/tutorial/creating-plugins.md).
