This guide explains how to configure tasks for your project using a Modfile.  If you don't know what a Modfile is, please read the [Getting Started](https://github.com/modjs/mod/blob/master/doc/tutorial/getting-started.md) guide.

# Tasks Configuration
Task configuration is specified in your Modfile via the `module.exports` propery. This configuration will mostly be under task-named properties, but may contain any arbitrary data. As long as properties don't conflict with properties your tasks require, they will be otherwise ignored.

Also, because this is JavaScript, you're not limited to JSON; you may use any valid JavaScript here. You may even programmatically generate the configuration if necessary.

```js
module.exports = {
    tasks: {
        cat: {
            // concat task configuration goes here.
        },
        min: {
            // min task configuration goes here.
        },

        // Arbitrary non-task-specific properties.
        my_property: 'whatever',
        my_src_files: ['foo/*.js', 'bar/*.js']
    }
};
```

## Task Configuration

When a task is run, Mod looks for its configuration under a property of the same name. Multi-tasks can have multiple configurations, defined using arbitrarily named "targets". In the example below, the `cat` task has `foo` and `bar` targets, while the `min` task only has a `baz` target.

```js
{
    lint: {
        // lint task options and files go here.
    },
    cat: {
        foo: {
            // concat task "foo" target options and files go here.
        },
        bar: {
            // concat task "bar" target options and files go here.
        }
    },
    min: {
        baz: {
            // min task "baz" target options and files go here.
        }
    },
}
```
Specifying both a task and target like `mod cat:foo` or `mod cat:bar` will process just the specified target's configuration, while running `mod cat` will iterate over _all_ targets, processing each in turn.

## Options
Inside a task configuration, an `options` property may be specified to override built-in defaults.  In addition, each target object self has `options` property which is specific to that target.  Target-level options will override task-level options.

The `options` object is optional and may be omitted if not needed.

```js
{
    cat: {
        options: {
            // Task-level options may go here, overriding task defaults.
        },
        foo: {
            // "foo" target options may go here, overriding task-level options.
        },
        bar: {
            // "bar" target options may go here, overriding task-level options.
        }
    }
}
```

## Targets Organization
There are two ways to organization targets, offering varying degrees of verbosity and control. Any multi task will understand all the following formats, so choose whichever format best meets your needs.

### Single target
This form allows a single **src-dest** (source-destination) file mapping per-target. It is most commonly used for read-only tasks, like `lint`, where a single `src` property is needed, and no `dest` key is relevant. This format also supports additional properties per src-dest file mapping.

```js
{
    lint: {
        foo: {
            src: ['src/foo.js', 'src/bar.js']
        }
    },
    cat: {
        bar: {
            src: ['src/foo.js', 'src/bar.js'],
            dest: 'dest/foobar.js',
        }
    }
}
```

### Group targets
This form supports multiple src-dest file mappings per-target, while also allowing `options` property.

```js
{
    cat: {
        options: {
            // Task-level options may go here, overriding task defaults.
        },
        foo: {
            group: [
                {src: ['src/aa.js', 'src/aaa.js'], dest: 'dest/a.js'},
                {src: ['src/aa1.js', 'src/aaa1.js'], dest: 'dest/a1.js'},
            ]
        },
        bar: {
            options: {
                // "bar" target options may go here, overriding task-level options.
            },
            group: [
                {src: ['src/bb.js', 'src/bbb.js'], dest: 'dest/b/'},
                {src: ['src/bb1.js', 'src/bbb1.js'], dest: 'dest/b1/', filter: 'isFile'},
            ],
        }
    }
}
```

## Custom Filter

The `filter` property can help you target files with a greater level of detail. The `filter` may be a valid [fs.Stats method name](http://nodejs.org/docs/latest/api/fs.html#fs_class_fs_stats), or a regexp, or a function that is passed the matched `src` filepath and returns `true` or `false`.

```js
{
    rm: {
        foo: {
            src: ['tmp/**/*'],
            filter: 'isFile',
        },
        bar: {
            src: ['tmp/**/*'],
            filter: /.*bar.js/,
        },
        baz: {
            src: ['tmp/**/*'],
            filter: function(filepath){
                // balabala
            },
        },
    }
}
```

## Globbing patterns

It is often impractical to specify all source filepaths individually, so Mod supports filename expansion (also know as globbing) via the built-in [node-glob][] and [minimatch][] libraries.

[node-glob]: https://github.com/isaacs/node-glob
[minimatch]: https://github.com/isaacs/minimatch

While this isn't a comprehensive tutorial on globbing patterns, know that in a filepath:

* `*` matches any number of characters, but not `/`
* `?` matches a single character, but not `/`
* `**` matches any number of characters, including `/`, as long as it's the only thing in a path part
* `{}` allows for a comma-separated list of "or" expressions
* `!` at the beginning of a pattern will negate the match

All most people need to know is that `foo/*.js` will match all files ending with `.js` in the `foo/` subdirectory, but `foo/**/*.js` will match all files ending with `.js` in the `foo/` subdirectory _and all of its subdirectories_.

Also, in order to simplify otherwise complicated globbing patterns, Mod allows arrays of file paths or globbing patterns to be specified. Patterns are processed in-order, with `!`-prefixed matches excluding matched files from the result set. The result set is uniqued.

## Templates

Templates specified using `{{ }}` delimiters will be automatically expanded when tasks read them from the config. Templates are expanded recursively until no more remain.

The entire config object is the context in which properties are resolved.

* `{{prop.subprop}}` Expand to the value of `prop.subprop` in the config, regardless of type. Templates like this can be used to reference not only string values, but also arrays or other objects.
* `{{ }}` Execute arbitrary inline JavaScript code. This is useful with control flow or looping.

Given the sample `cat` task configuration below, running `mod cat` will generate a file named `build/abcde.js`.

```js
{
    cat: {
        sample: {
            src: ['{{ qux }}', 'baz/*.js'],  // [['foo/*.js', 'bar/*.js'], 'baz/*.js']
            dest: 'build/{{ baz }}.js',      // 'build/abcde.js'
        },
    },
    // Arbitrary properties used in task configuration templates.
    foo: 'c',
    bar: 'b{{ foo }}d', // 'bcd'
    baz: 'a{{ bar }}e', // 'abcde'
    qux: ['foo/*.js', 'bar/*.js'],
}
```
