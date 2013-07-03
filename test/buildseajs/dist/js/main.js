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

define("js/spinning", [ "jquery" ], function(require, exports, module) {
    var $ = require("jquery");
    function Spinning(container) {
        this.container = $(container);
        this.icons = this.container.children();
        this.spinnings = [];
    }
    module.exports = Spinning;
    Spinning.prototype.render = function() {
        this._init();
        this.container.css("background", "none");
        this.icons.show();
        this._spin();
    };
    Spinning.prototype._init = function() {
        var spinnings = this.spinnings;
        $(this.icons).each(function(n) {
            var startDeg = random(360);
            var node = $(this);
            var timer;
            node.css({
                top: random(40),
                left: n * 50 + random(10),
                zIndex: 1e3
            }).hover(function() {
                node.fadeTo(250, 1).css("zIndex", 1001).css("transform", "rotate(0deg)");
            }, function() {
                node.fadeTo(250, .6).css("zIndex", 1e3);
                timer && clearTimeout(timer);
                timer = setTimeout(spin, Math.ceil(random(1e4)));
            });
            function spin() {
                node.css("transform", "rotate(" + startDeg + "deg)");
            }
            spinnings[n] = spin;
        });
        return this;
    };
    Spinning.prototype._spin = function() {
        $(this.spinnings).each(function(i, fn) {
            setTimeout(fn, Math.ceil(random(3e3)));
        });
        return this;
    };
    function random(x) {
        return Math.random() * x;
    }
});
define("js/main", [ "./spinning", "jquery" ], function(require) {
    var Spinning = require("js/spinning");
    var s = new Spinning("#container");
    s.render();
});
seajs.use("js/main");