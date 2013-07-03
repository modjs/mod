// plugin-shim
(function(d,e){function a(c){if(c){c=c.alias;for(var a in c)(function(b){b.src&&(b.deps&&define(b.src,b.deps),define(a,[d.resolve(b.src)],function(){var a=b.exports;return"function"===typeof a?a():"string"===typeof a?e[a]:a}))})(c[a])}}d.on("config",a);a(d.config.data)})(seajs,"undefined"===typeof global?this:global);

seajs.config({
    // Enable plugins
    plugins:[],

    // Configure alias
    alias: {
        'jquery': {
            src: 'http://code.jquery.com/jquery-1.9.1.min.js',
            exports: 'jQuery'
        }
    }
});

define("js/c", [], function(require) {
    return {
        c: 3
    };
});
define("js/b", [ "./c" ], function(require) {
    return {
        b: 2,
        c: require("js/c")
    };
});
define("js/a", [ "./b", "./c" ], function(require) {
    return {
        a: 1,
        b: require("js/b")
    };
});
define("js/main", [ "./a", "./b", "./c", "jquery" ], function(require) {
    var a = require("js/a");
    var $ = require("jquery");
    $("#hi").text(JSON.stringify(a));
});
seajs.use("js/main");