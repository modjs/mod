define("a.js",["./b"],function(e){return e("./b"),{a:1}});
define("b.js",["./c"],function(e){return e("./c"),{b:2}});
define("c.js",[],function(e){return{c:3}});