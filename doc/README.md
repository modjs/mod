# Documents
## Tutorials
* [Getting Started](https://github.com/modjs/mod/tree/master/doc/tutorial/getting-started.md)
* [Configuring Tasks](https://github.com/modjs/mod/blob/master/doc/tutorial/configuring-tasks.md)
* [Creating Plugins](https://github.com/modjs/mod/tree/master/doc/tutorial/creating-plugins.md)

## Built-in Tasks
Mod supports a powerful set of high-level tasks:

* [help](https://github.com/modjs/mod/tree/master/doc/tasks/help.md) - get help on mod 
* [build](https://github.com/modjs/mod/tree/master/doc/tasks/build.md) - build project with html 
* [init](https://github.com/modjs/mod/tree/master/doc/tasks/init.md) - generate project skeleton from template 
* [watch](https://github.com/modjs/mod/tree/master/doc/tasks/watch.md) - run predefined tasks whenever watched files change 
* [deploy](https://github.com/modjs/mod/tree/master/doc/tasks/deploy.md) - remote deployment via ssh 
* [download](https://github.com/modjs/mod/tree/master/doc/tasks/download.md) - download resource from URI 
* [compile](https://github.com/modjs/mod/tree/master/doc/tasks/compile.md) - compile JavaScript/CSS/HTML source 
* [min](https://github.com/modjs/mod/tree/master/doc/tasks/min.md) - minify JavaScript/CSS/HTML source 
* [replace](https://github.com/modjs/mod/tree/master/doc/tasks/replace.md) - replace the contents of files 
* [cat](https://github.com/modjs/mod/tree/master/doc/tasks/cat.md) - concatenate the content of files 
* [cp](https://github.com/modjs/mod/tree/master/doc/tasks/cp.md) - copy one or more files to another location 
* [mkdir](https://github.com/modjs/mod/tree/master/doc/tasks/mkdir.md) - make a new directory 
* [mv](https://github.com/modjs/mod/tree/master/doc/tasks/mv.md) - move or rename files or directories 
* [rm](https://github.com/modjs/mod/tree/master/doc/tasks/rm.md) - remove files 
* [rev](https://github.com/modjs/mod/tree/master/doc/tasks/rev.md) - rename file with it hash value 
* [strip](https://github.com/modjs/mod/tree/master/doc/tasks/strip.md) - source stripping 

## API

* [exports](https://github.com/modjs/mod/tree/master/doc/api/exports.md) - The exports API 
* [exports.file](https://github.com/modjs/mod/tree/master/doc/api/file.md) - There are many provided methods for reading and writing files, traversing the filesystem and finding files by matching globbing patterns. Many of these methods are wrappers around built-in Node.js file functionality, but with additional error handling, logging and character encoding normalization. 
* [exports.utils](https://github.com/modjs/mod/tree/master/doc/api/utils.md) - Miscellaneous utilities 
* [exports.template](https://github.com/modjs/mod/tree/master/doc/api/template.md) - Compiles templates into strings 
* [exports._](http://underscorejs.org/) - Underscore provides 80-odd functions that support both the usual functional suspects: map, select, invoke — as well as more specialized helpers: function binding, javascript templating, deep equality testing, and so on. It delegates to built-in functions, if present, so modern browsers will use the native implementations of forEach, map, reduce, filter, every, some and indexOf.
* [exports.async](https://github.com/caolan/async) - Async provides around 20 functions that include the usual 'functional' suspects (map, reduce, filter, each…) as well as some common patterns for asynchronous control flow (parallel, series, waterfall…). All these functions assume you follow the node.js convention of providing a single callback as the last argument of your async function.
* [exports.request](https://github.com/mikeal/request) - Simplified HTTP request method
* [exports.prompt](https://github.com/flatiron/prompt) - Using prompt is relatively straight forward. There are two core methods you should be aware of: prompt.get() and prompt.addProperties(). There methods take strings representing property names in addition to objects for complex property validation (and more).


