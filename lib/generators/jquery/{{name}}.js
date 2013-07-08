(function (factory) {
    if (typeof define === 'function') {
        define(['$'], factory);
    } else {
        factory($);
    }
})(function ($) {
    'use strict';

    var pluginName = '{{name}}';

    function plugin( options ){
        // ...
    } 

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            // ...
        })

    };

    $[pluginName] = plugin;
})