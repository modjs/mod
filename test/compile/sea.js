define("a.js",["./b"],function(e){return e("./b"),{"作者":"元彦",version:VERSION}});
define("b.js",["./c"],function(e){return e("./c"),{}});
define("c.js",["jquery"],function(e){return e("jquery"),{}});