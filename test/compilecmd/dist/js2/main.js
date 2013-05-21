

define("./js/main",["./a","./b","./c","jquery"],function(require){var a=require("js/a");var $=require("jquery");$("#hi").text(JSON.stringify(a))});
define("js/a",["./b","./c"],function(require){return{a:1,b:require("js/b")}});
define("js/b",["./c"],function(require){return{b:2,c:require("js/c")}});
define("js/c",[],function(require){return{c:3}});





seajs.use("./js/main");