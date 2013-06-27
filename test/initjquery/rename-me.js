! (function (factory) {
    if (typeof define === 'function') {
        define(['$'], factory);
    } else {
        factory($);
    }
})(function ($) {
    'use strict';

    var pluginName = 'rename-me';

    function plugin( options ){
        // ...
    } 

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            // ...
        })

    });

    $[pluginName] = plugin;
})