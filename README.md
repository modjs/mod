<p align="center">
<a href="http://madscript.com/modjs" target="_blank">
<img src="https://f.cloud.github.com/assets/677114/1474125/3f5b2460-4629-11e3-8a3d-6b4e0162e0cf.png" alt="mod" style="max-width:100%;">
</a>
</p>

<p align="center">
<a href="http://badge.fury.io/js/modjs"><img src="https://badge.fury.io/js/modjs.png" alt="NPM version" style="max-width:100%;"></a>
<a href="http://travis-ci.org/modulejs/modjs"><img src="https://secure.travis-ci.org/modulejs/modjs.png?branch=master" alt="Build Status" style="max-width:100%;"></a>
</p>


Mod is a [task-based](https://github.com/taskjs/spec) workflow tooling for web, it help developers quickly build robust and high-performance HTML5 applications.

## Why modjs?
* Focus on the workflow of web development
* Much built-in tasks, most pleasant out-of-the-box experience
    - Built-in source minify: `JS, CSS, HTML`
    - Built-in modular JS compile: `AMD, CMD (will support ES6 Module, CommonJS Module soon)`
    - Built-in CSS @import file combination
    - Built-in source stripping, automatically remove debugging code
    - Built-in basic file operation: `cat, rm, mv, mkdir, cp, rev`
    - Built-in file watcher, trigger custom tasks when file change
    - Built-in live browser reloads, instantly see changes in your browser
    - Built-in web server with very useful feature like [remote logging for mobile development](https://github.com/modulejs/modjs/tree/master/example/serverconsole)
* More simplicity plugin mechanism, auto-install plugins
* Configuration less(even zero), do more
    - Build by html: `mod build index.html`
* Compatible with [Grunt](http://gruntjs.com) plugins, with literally hundreds of plugins to choose from

## Installation
[Mod](https://npmjs.org/package/modjs) is installed using [NPM(Node Package Manager)](http://npmjs.org/)
```sh
$ npm install modjs -g
```

## Tutorials
* [Getting Started](https://github.com/modulejs/modjs/tree/master/doc/tutorial/getting-started.md)
* [Configuring Tasks](https://github.com/modulejs/modjs/blob/master/doc/tutorial/configuring-tasks.md)
* [Creating Plugins](https://github.com/modulejs/modjs/tree/master/doc/tutorial/creating-plugins.md)

## Documents
* [Built-in Task](https://github.com/modulejs/modjs/tree/master/doc/tasks)
* [Plugin API](https://github.com/modulejs/modjs/tree/master/doc/api)

## Quick Build Demo
* [Plain Project Build](https://github.com/modulejs/modjs/tree/master/example/buildnormal)
* [Mobile Project Build](https://github.com/modulejs/modjs/tree/master/example/buildmobile)
* [RequireJS Project Build](https://github.com/modulejs/modjs/tree/master/example/buildrequirejs)
* [SeaJS Project Build](https://github.com/modulejs/modjs/tree/master/example/buildseajs)

## Built-in Task Examples
* [Concatenate JS Files](https://github.com/modulejs/modjs/tree/master/example/catjs)
* [Concatenate CSS Files](https://github.com/modulejs/modjs/tree/master/example/catcss)
* [AMD Modules Compile](https://github.com/modulejs/modjs/tree/master/example/compileamd)
* [CMD Modules Compile](https://github.com/modulejs/modjs/tree/master/example/compilecmd)
* [Mutil-page Modules Compile](https://github.com/modulejs/modjs/tree/master/example/compilecmd)
* [CSS Precompile](https://github.com/modulejs/modjs/tree/master/example/compilecss)
* [HTML Precompile](https://github.com/modulejs/modjs/tree/master/example/compilehtml)
* [JS Minify](https://github.com/modulejs/modjs/tree/master/example/minjs)
* [CSS Minify](https://github.com/modulejs/modjs/tree/master/example/mincss)
* [HTML Minify](https://github.com/modulejs/modjs/tree/master/example/minhtml)
* [Code Stripping](https://github.com/modulejs/modjs/tree/master/example/stripcode)
* [EOL Stripping](https://github.com/modulejs/modjs/tree/master/example/stripeol)
* [Tab Stripping](https://github.com/modulejs/modjs/tree/master/example/striptab)
* [Inline Images DataURI](https://github.com/modulejs/modjs/tree/master/example/datauri)
* [Make Dir](https://github.com/modulejs/modjs/tree/master/example/mkdir)
* [Copy Files](https://github.com/modulejs/modjs/tree/master/example/cp)

## Plugins Examples
* [NPM Task: mod-stylus](https://github.com/modulejs/modjs/tree/master/example/pluginnpmtask)
* [Local Task: mytask.js](https://github.com/modulejs/modjs/tree/master/example/pluginlocaltask)
* [Grunt Task: grunt-contrib-concat](https://github.com/modulejs/modjs/tree/master/example/plugingrunttask)

## Built-in Web Server Examples
* [Server with remote logging for mobile development](https://github.com/modulejs/modjs/tree/master/example/serverconsole)
* [Server with proxy setting](https://github.com/modulejs/modjs/tree/master/example/serverproxy)

## IDE Support
* [Sublime-Mod](https://github.com/yuanyan/sublime-mod)

## Platform Support
Mod support Windows, OS X, Linux...

## Issue Submission
Submit a [new issue](https://github.com/modulejs/modjs/issues/new).

## About
Mod is an open-source project by [Tencent](http://www.tencent.com/en-us/) which builds on top of [Node.js](https://nodejs.org).
We utilize a number of useful open-source solutions including:

* UglifyJS
* CleanCSS
* HTMLMinifiler
* RequireJS
* SeaJS
* JSConsole

## Used by people within <a href="https://github.com/modulejs/modjs/issues/22">(JOIN US)</a>
![qqfind](http://0.web.qstatic.com/webqqpic/pubapps/0/50/images/big.png)
![qqconnect](http://0.web.qstatic.com/webqqpic/pubapps/0/16/images/big.png)


## License
Mod is released under a [MIT](http://yuanyan.mit-license.org/) license.
