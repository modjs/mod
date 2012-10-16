# modjs - 前端模块化构建工具

## 特性

* 模块一键安装 - 告别手动下载模块，一个命令行即可安装所有模块
* 模块依赖管理 - 告别人肉管理模块依赖，解放双方
* AMD、CMD模块打包 - 集成requirejs、seajs模块加载器
* CSS 模块打包 - CSSS @import 模块合并打包
* 压缩合并一体化 - HTML CSS Javascript 压缩合并 so easy
* 源码智能化压缩 - 零配置自动识别源码是否被压缩过，避免二次压缩带来的问题
* 图片自动无损压缩 - 零配置自动识别图片，支持 PNG、JPG、GIF 图片压缩
* 源码规范检测 - HTML CSS Javascript 规范性检测
* 源码自定义检测 - 自定义规则检测， 避免 alert 等疏忽
* 工具跨平台支持 - 基于 Nodejs


## 快速入门

### 创建项目

```bash
$ mod create projectname
$ cd projectname
```

等同于

```bash
$ mkdir projectname
$ cd projectname
$ mod init   # init 后带传模块名与模版名参数，默认取目录名为模块名
```

### 安装模块

```bash
$ mod install backbone
```

### 使用模块

默认使用 requirejs 为项目模块加载器：

```html
<script src="modules/require.js"></script>

<script>
    require(['jquery','underscore','backbone'], function ($, _, backbone) {
        ...
    });
</script>
```

切换为 seajs 只需在安装模块之前配置 loader 为 seajs：

```html
<script src="modules/sea.js"></script>

<script>
    seajs.use(['jquery','underscore','backbone'], function ($, _, backbone) {
        ...
    });
</script>
```

## 工具安装

### node.js

   $ npm install modjs -g

### git

   git clone git://github.com/modulejs/modjs.git

## 内置任务
```
  help            显示帮助
  search          搜索可用的模块
  install         安装指定的模块
  upgrade         升级模块至最新的版本
  uninstall       从模块目录下移除指定的模块
  compile         模块编译与打包
  clean           清除未使用的模块
  ls              列出已安装的模块
  clear-cache     清除本地模块缓存
  publish         发布模块至服务器仓库
  unpublish       移除远程仓库中指定的模块
  link            本地创建连接至开发中的模块
  pack            创建 tar.gz 格式压缩包
  rebuild         重新生成 模块加载器 与 配置选项
  create          通过样板创建项目
  min             压缩与优化CSS、JS、HTML、Image文件
  lint            对CSS、JS、HTML文件进行规范性检测
  opti-image      Image 无损压缩
  opti-css        CSS 合并优化
  cleancss        CSS 压缩
  csslint         CSS 规范性检测
  jshint          JS 规范性检测
  uglifyjs        JS 压缩
  htmlminifier    HTML 压缩
  datauri         图片 URL 转换成 Datauri 格式
  concat          文本文件合并
  rev             文件 MD5 计算
  replace         文本替换
  bom-strip       文件 BOM 清除
  deploy          部署
```

### 命令行参数

如可分别通过 模块名, Git地址, URL地址, 本地地址,package.json配置 安装模块：

```
mod install jquery
mod install git://github.com/jquery/jquery.git
mod install http://code.jquery.com/jquery-1.8.2.js
mod install ./modules/jquery

{
    "name": "your app name"
  , "version": "0.0.1"
  , "dependencies": {
      "jquery": ">=1.8.0"
  }
}

mod install .
```

### package.json 配置

Mod package.json 配置是对NPM配置的扩展，只引入了 mod 配置项，避免配置规则的冲突：
```
{
   "name": "playground",
   "version": "1.0.0",
   "mod": {
      "loader" : "seajs"
      ,"main" : "./modulejs"
      ,"repositories" : [
            "http://mycorporation.com:5984/repository/"
           ,"http://modjs.org/repository"
      ]
      ,"package_dir : "vendor"
      ,"plugins": {
          "reload" : "mod-reload"
          ,"ghpages-deploy" : "mod-ghpages-deploy"
      }

      // 模块依赖
      ,"dependencies": {
           "jquery": ">=0.0.2"
           ,"underscore": ">=0.0.2"
      }

      // task 是单个任务的抽象
      ,"tasks": {

      }

      // target 是多个任务协同的抽象
      ,"targets":{

      }
   }

   , "license": {
         "type": "MIT",
         "url": "https://github.com/modulejs/playground/raw/master/LICENSE"
   },
}
```

#### 必选配置项

* name: 模块名只能包含小写字母数字和中划线
* version: 版本号

#### 可选配置项

* license: 版本声明
* dependencies: 模块依赖
* description: 模块描述
* author: 模块作者信息
* repository: 模块项目地址
* tests: 测试用例

### .modrc 配置

.modrc (modjs runtime config) 是对 modjs 运行环境参数的配置，包括插件的配置：

```
// 配置模块装载器
exports.loader = 'seajs';

// 自定义模块仓库地址
exports.repositories = [
    "http://mycorporation.com:5984/repository/"
   ,"http://modjs.org/repository"
];

// 修改默认的 ./modules 目录
exports.package_dir = 'vendor';

// modjs 任务插件配置
exports.plugins = {
    'appcache'：require("mod-appcache"),
    'ghpages-deploy'： require("mod-ghpages-deploy")
}

// 如配置代理，可指定需排除代理的Host, 默认以包含localhost与127.0.0.1
exports.proxyExcludeHost = "*.oa.com"
```
## 配置详解

### 版本规则

版本号主体由 3 组数字组成的 Major.minor.patch 格式，并且约定开发中的模块版本号应加上 -dev 后缀：
```
1.0.0
0.1.1-dev
```
### 模块依赖版本条件
```
latest
>1.2.3
<1.2.3
1.2.3 - 2.3.4 := >=1.2.3 <=2.3.4
~1.2.3 := >=1.2.3 <1.3.0
~1.2 := >=1.2.0 <2.0.0
~1 := >=1.0.0 <2.0.0
1.2.x := >=1.2.0 <1.3.0
1.x := >=1.0.0 <2.0.0
```

### 文件匹配规则

匹配符：
* "*" 匹配0个或多个字符
* "?" 匹配单个字符
* "！" 匹配除此之外的字符
* "[]" 匹配指定范围内的字符，如：[0-9]匹配数字0-9 [a-z]配置字母a-z
* "{x,y}" 匹配指定组中某项，如 a{d,c,b}e 匹配 ade ace abe

示例：
```
c/ab.min.js =>  c/ab.min.js
*.js        =>  a.js b.js c.js
c/a*.js     =>  c/a.js  c/ab.js c/ab.min.js
c/[a-z].js  =>  c/a.js c/b.js c/c.js
c/[!abe].js =>  c/c.js c/d.js
c/a?.js     =>  c/ab.js c/ac.js
c/ab???.js  =>  c/abdef.js c/abccc.js
c/[bdz].js  =>  c/b.js c/d.js c/z.js
{a,b,c}.js  =>  a.js b.js c.js
a{b,c{d,e}}x{y,z}.js  => abxy.js abxz.js  acdxy.js acdxz.js acexy.js acexz.js
```

## 插件体系

### 开发插件
```
// mod-reload.js
exports.run = function (args, taskConfig, rc, tasks, configs) {

}
```

* args: 命令行参数
* taskConfig： 当前任务在 package.json 中的配置
* rc: .modrc 文件配置
* tasks: 任务索引，通过 tasks.min.run() 执行指定任务
* configs： package.json 文件配置

### 发布插件

    npm publish mod-reload

### 安装插件

    npm install mod-reload -g


## FAQ

### Mod 与 Jam, Volo, Ender 有什么区别? 哪一个更好?

Mod 是面向模块化前端的构建工具，Jam, Volo, Ender 等这些的模块管理功能只是 Mod 模块化构建中的几项任务。

相比之 Mod 更像是 Grunt 这类任务管理工具，都是以任务为核心。也因此 Mod 具有很强的扩张性，而 Jam, Volo, Ender 难具有很好插件机制。

Mod 致力于模块化前端开发模式，简化前端构建的繁琐流程，加强前端发布的安全稳定。

### 谁在维护与使用 Mod？

Mod 是来自腾讯的开源项目，目前由腾讯的前端工程师在维护与使用，也诚邀有梦想的您可以加入我们一起共同筑造。

## 感谢

感谢 modjs 依赖的开源项目：

* tar
* fstream-ignore
* fstream
* mkdirp
* inherits
* async
* mime
* underscore
* prompt
* rimraf
* semver
* ncp
* requirejs
* almond
* seajs
* request
* minimatch
* clean-css
* uglify-js
* html-minifier
* jshint
* csslint
* colors
* optimist


