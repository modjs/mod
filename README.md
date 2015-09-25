<h2>Stopped developping on modjs and switched to <a href="http://github.com/chajs/cha"><img src="https://avatars0.githubusercontent.com/u/6767978?v=2&s=25">chajs</a></h2>
            
<p align="center">
<a href="http://madscript.com/modjs" target="_blank">
<img src="https://f.cloud.github.com/assets/677114/1474125/3f5b2460-4629-11e3-8a3d-6b4e0162e0cf.png" alt="Mod.js" style="max-width:100%;">
</a>
</p>

<p align="center">
<a href="http://badge.fury.io/js/modjs"><img src="https://badge.fury.io/js/modjs.png" alt="NPM version" style="max-width:100%;"></a>
<a href="http://travis-ci.org/modjs/mod"><img src="https://secure.travis-ci.org/modjs/mod.png?branch=master" alt="Build Status" style="max-width:100%;"></a>
</p>

Mod.js is a [task-based](https://github.com/taskjs/spec) workflow tooling for web, it helps developers quickly build robust and high-performance HTML5 applications.

## Why Mod.js?
* Focus on the workflow of web development
* Much built-in tasks, most pleasant out-of-the-box experience
    - Built-in source minify: `JS, CSS, HTML`
    - Built-in modular JS compile: `AMD, CMD (will support ES6 Module, CommonJS Module soon)`
    - Built-in CSS @import file combination
    - Built-in source stripping, automatically remove debugging code
    - Built-in basic file operation: `cat, rm, mv, mkdir, cp, rev`
    - Built-in file watcher, trigger custom tasks when file change
* More simplicity plugin mechanism, auto-install plugins
* Configuration less(even zero), do more
    - Build by html: `mod build index.html`
* Compatible with [Grunt](http://gruntjs.com) plugins, with literally hundreds of plugins to choose from

## Installation
[Mod.js](https://npmjs.org/package/modjs) is installed using [NPM(Node Package Manager)](http://npmjs.org/)
```sh
$ npm install modjs -g
```

## Tutorials
* [Getting Started](https://github.com/modjs/mod/tree/master/doc/tutorial/getting-started.md)
* [Configuring Tasks](https://github.com/modjs/mod/blob/master/doc/tutorial/configuring-tasks.md)
* [Creating Plugins](https://github.com/modjs/mod/tree/master/doc/tutorial/creating-plugins.md)

## Documents
* [Built-in Task](https://github.com/modjs/mod/tree/master/doc/tasks)
* [Plugin API](https://github.com/modjs/mod/tree/master/doc/api)

## Quick Build Demo
* [Plain Project Build](https://github.com/modjs/mod/tree/master/example/buildnormal)
* [Mobile Project Build](https://github.com/modjs/mod/tree/master/example/buildmobile)
* [RequireJS Project Build](https://github.com/modjs/mod/tree/master/example/buildrequirejs)

## Built-in Task Examples
* [Concatenate JS Files](https://github.com/modjs/mod/tree/master/example/catjs)
* [Concatenate CSS Files](https://github.com/modjs/mod/tree/master/example/catcss)
* [AMD Modules Compile](https://github.com/modjs/mod/tree/master/example/compileamd)
* [CMD Modules Compile](https://github.com/modjs/mod/tree/master/example/compilecmd)
* [Mutil-page Modules Compile](https://github.com/modjs/mod/tree/master/example/compilemultipage)
* [JS Conditional Compilation](https://github.com/modjs/mod/tree/master/example/compilejs)
* [CSS Conditional Compilation](https://github.com/modjs/mod/tree/master/example/compilecss)
* [HTML Conditional Compilation](https://github.com/modjs/mod/tree/master/example/compilehtml)
* [JS Minify](https://github.com/modjs/mod/tree/master/example/minjs)
* [CSS Minify](https://github.com/modjs/mod/tree/master/example/mincss)
* [HTML Minify](https://github.com/modjs/mod/tree/master/example/minhtml)
* [Code Stripping](https://github.com/modjs/mod/tree/master/example/stripcode)
* [EOL Stripping](https://github.com/modjs/mod/tree/master/example/stripeol)
* [Tab Stripping](https://github.com/modjs/mod/tree/master/example/striptab)
* [Inline Images DataURI](https://github.com/modjs/mod/tree/master/example/datauri)
* [Make Dir](https://github.com/modjs/mod/tree/master/example/mkdir)
* [Copy Files](https://github.com/modjs/mod/tree/master/example/cp)
* [String Replace](https://github.com/modjs/mod/tree/master/example/replace)

## Plugins Examples
* [NPM Task: mod-stylus](https://github.com/modjs/mod/tree/master/example/pluginnpmtask)
* [Local Task: mytask.js](https://github.com/modjs/mod/tree/master/example/pluginlocaltask)
* [Grunt Task: grunt-contrib-concat](https://github.com/modjs/mod/tree/master/example/plugingrunttask)

## IDE Support
* [Sublime-Mod](https://github.com/yuanyan/sublime-mod)

## Platform Support
Mod support Windows, OS X, Linux...

## Issue Submission
Submit a [new issue](https://github.com/modjs/mod/issues/new).

## Release History

* 2014-02-28    v0.4.6    Fix r.js build error.
* 2014-02-20    v0.4.5    Remove built-in `server` task.     

## About
Mod is an open-source project by [Tencent](http://www.tencent.com/en-us/) which builds on top of [Node.js](https://nodejs.org).
We utilize a number of useful open-source solutions including:

* UglifyJS
* CleanCSS
* HTMLMinifiler
* RequireJS

## Used by people within <a href="https://github.com/modjs/mod/issues/22">(JOIN US)</a>
![Tencent](http://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Tencent_Logo.svg/200px-Tencent_Logo.svg.png)

## License
Mod.js is released under a [MIT](http://yuanyan.mit-license.org/) license.
