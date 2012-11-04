# modjs - 前端模块化构建工具

## 特性

* 模块一键安装 - 告别手动下载模块，一个命令行即可安装所有模块
* 模块依赖管理 - 告别人肉管理模块依赖，解放双方
* AMD、CMD模块打包 - 集成requirejs、seajs模块加载器
* CSS 模块打包 - CSS @import 模块合并打包
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
  search          模块搜索
  install         模块安装
  upgrade         模块升级
  uninstall       模块移除
  compile         模块编译与打包
  clean           清除未使用的模块
  ls              模块已安装列表
  clear-cache     清除本地模块缓存
  publish         模块发布至远程仓库
  unpublish       移除远程仓库的模块
  link            本地创建连接至开发中的模块
  pack            创建压缩包
  rebuild         重新生成 模块加载器 与 配置选项
  
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
  create          通过样板创建项目
  init            通过样板创建项目
  target          任务预处理
  rev             文件 MD5 计算

  replace         文本替换
  cat             文本文件合并
  cp              文件复制
  mkdir           新建目录
  mv              移动文件或目录
  rm              移除
  fmt             文件格式化
```

### 命令行参数

如可分别通过 模块名, Git地址, URL地址, 本地地址,package.json配置 安装模块：

```
// 安装最新的版本
mod install jquery
// 安装指定的版本
mod install jquery@1.8.2
// 从远程 tarball 地址安装
mod install https://github.com/jquery/jquery/tarball/1.8.2
// 从本地 tarball 路径安装
mod install ./path/to/jquery-jquery-1.8.2-0-g6e99558.tar.gz
// 从单独的模块文件安装
mod install http://code.jquery.com/jquery-1.8.2.js
// 从本地目录安装
mod install ./path/to/jquery
// 从 git 库安装
mod install git://github.com/jquery/jquery.git
// 从 Github 库安装的简写方式: gh:user/repository/branch, branch为可选，默认为master
mod install gh:jquery/jquery
// 从 package.json 配置安装
mod install ./package.json
{
    "name": "your app name"
  , "version": "0.0.1"
  , "dependencies": {
      "jquery": ">=1.8.0"
  }
}
```

### package.json 配置

Mod package.json 配置是对NPM配置的扩展，只引入了 mod 顶级配置项，避免配置规则的冲突：
```
{
   "name": "playground",
   "version": "1.0.0",
   "mod": {
      "loader" : "seajs"
      ,"main" : "./src/odulejs"
      ,"repositories" : [
            "http://mycorporation.com:5984/repository/"
           ,"http://modjs.org/repository"
      ]
      // 模块目录，默认为 modules
      ,"modules" : "vendor"

      // 配置安装插件对应的名称，不配置则按约定名称关系查找，如 reload 对应 mod-reload 模块
      ,"plugins": {
          "reload" : "mod-reloadx"
          ,"ghpages-deploy" : "mod-ghpages-deploy"
      }

      // 模块依赖
      ,"dependencies": {
           "jquery": ">=0.0.2"
           ,"underscore": ">=0.0.2"
      }

    // task 配置
     ,"configs":{

      }

      // task 是单个任务的抽象
      ,"tasks": {
            "min" : {
                "source": "./test/cat/ab.js",
                "dest": "./test/min/ab.js"
            },

            "lint" : {
                "source": "./test/cat/ab.js"
            },

            "mkdir": {
               "target" : "./test/mkdir/"
            },

            "cp":{
               "source" : "./test/min/ab.js",
                "dest" : "./test/mkdir/ab.js"
            },

            "cat": {
                "source":["./test/cat/a.js","./test/cat/b.js"],
                "dest":"./test/cat/ab.js"
            }

      }

      // target 是多个任务协同的抽象
      ,"targets":{
          "all" : "mkdir cat lint min cp"
      }
   }

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
exports.modules = 'vendor';

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

版本号主体由 3 组数字组成的 <主版本号>.<次版本号>.<补丁版本号> 格式，并且约定开发中的模块版本号应加上 -dev 后缀：

```
1.0.0
0.1.1-dev
```

* 进行不向下兼容的修改时增长主版本号
* 增加API但保持向下兼容时增长次版本号
* Bug修复但不影响API时增长补丁版本号

更多语义版本内容请访问 http://semver.org/


### 模块依赖版本条件
```
latest        :=    latest
>1.2.3        :=    >1.2.3
<1.2.3        :=    <1.2.3
~1.2.3        :=    >=1.2.3 <1.3.0
~1.2          :=    >=1.2.0 <2.0.0
~1            :=    >=1.0.0 <2.0.0
1.2.x         :=    >=1.2.0 <1.3.0
1.x           :=    >=1.0.0 <2.0.0
1.2.3 - 2.3.4 :=    >=1.2.3 <=2.3.4
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
exports.summary = '小白爱插件';

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

exports.run = function (opt, config, callback) {
    var target = opt.target;
    // ...
};
```

* opt: 命令行参数
* config： 当前任务在 package.json 中的配置
* callback： 任务回调

### 插件API
```
exports.taskName
exports.loadTask
exports.runTask

exports.getArgs
exports.getGlobalRC
exports.getPackageJSON

exports.log
exports.error
exports.warn
exports.debug

exports.file
exports.utils

exports._
exports.async
exports.request
exports.prompt
```

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

## Issues

发现bug了吗，亲？ 请移步 Github: https://github.com/modulejs/modjs/issues

## Authors

* 元彦
    * http://github.com/yuanyan
    * http://weibo.com/caoyuanyan

## Thanks

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


