<p align="center">
<a href="https://f.cloud.github.com/assets/677114/781449/97479306-ea22-11e2-8c06-a6f403e0f81a.png" target="_blank">
<img src="https://f.cloud.github.com/assets/677114/781449/97479306-ea22-11e2-8c06-a6f403e0f81a.png" alt="mod" style="max-width:100%;">
</a>
</p>

<p align="center">
<a href="http://badge.fury.io/js/modjs"><img src="https://badge.fury.io/js/modjs.png" alt="NPM version" style="max-width:100%;"></a>
<a href="http://travis-ci.org/modulejs/modjs"><img src="https://secure.travis-ci.org/modulejs/modjs.png?branch=master" alt="Build Status" style="max-width:100%;"></a>
</p>


Mod is a task-based workflow tooling for web, it help developers quickly build robust and high-performance HTML5 applications.

## Installation
[Mod](https://npmjs.org/package/modjs) is installed using [NPM(Node Package Manager)](http://npmjs.org/)
```sh
$ npm install modjs -g
```

## Website
* English Website：http://modulejs.github.io/modjs
* 中文主页：http://madscript.com/modjs

## Why another one?
* Focus on the workflow of web development 
* Built-in tasks
* More simplicity plugin mechanism
* Configuration less(even zero), do more

## Tutorials
* [Getting Started](https://github.com/modulejs/modjs/tree/master/doc/tutorial/getting-started.md)
* [Configuring Tasks](https://github.com/modulejs/modjs/blob/master/doc/tutorial/configuring-tasks.md)
* [Creating Plugins](https://github.com/modulejs/modjs/tree/master/doc/tutorial/creating-plugins.md)

## Documents
* [Built-in Task](https://github.com/modulejs/modjs/tree/master/doc/tasks)
* [Plugin API](https://github.com/modulejs/modjs/tree/master/doc/api)

## Quick Build Demo
* [Plain Project Build](https://github.com/modulejs/modjs/tree/master/test/buildnormal)
* [RequireJS Project Build](https://github.com/modulejs/modjs/tree/master/test/buildrequirejs)
* [SeaJS Project Build](https://github.com/modulejs/modjs/tree/master/test/buildseajs)

## IDE Support
* [Sublime-Mod](https://github.com/yuanyan/sublime-mod)

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
* [Plugin Task: CSS Images Sprites](https://github.com/modulejs/modjs/tree/master/test/pluginnpmtask)
* [Custom Task: Hello ModJS](https://github.com/modulejs/modjs/tree/master/test/pluginlocaltask)
* [Init Modfile](https://github.com/modulejs/modjs/tree/master/test/initmodfile)
* [Init jQuery](https://github.com/modulejs/modjs/tree/master/test/initjquery)


## Features
* Build with main html
* Task-based workflow
* Source minify: JS, CSS, HTML
* Modular JS for the web: AMD, CMD(will support CommonJS soon)
* CSS @import file combination
* Source stripping, automatically remove debugging code
* Basic operation: cat, rm, mv, mkdir, cp, rev
* File watcher, trigger custom tasks when file change
* Live Browser Reloads, instantly see changes in your browser
* Image Optimization, reduce JPEG, PNG file sizes
* Project boilerplate generate
* Built-in Web Server: `mod server`
* Extensible, easily write plugins

## Preview
![screenshot](https://raw.github.com/modulejs/modjs/master/example/screenshot.gif)


## Platform Support
Mod support Windows, OS X, Linux...

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
Mod is released under a [MIT](http://yuanyan.mit-license.org/) license.
