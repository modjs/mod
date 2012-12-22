/*global jQuery, localStorage, _, List */
(function( win, $ ) {
    'use strict';

    // Required by jquery-ajax-localstorage-cache
    win.Modernizr = {};
    /*jshint sub:true */
    win.Modernizr['localstorage'] = function() {
        var mod = 'mod';
        try {
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    };

    function render( data ) {
        var components = _.sortBy( JSON.parse( data ), function( el ) {
            return el.name.toLowerCase();
        });

        var componentsTpl = _.template( $('#components-template').html(), {
            components: components
        });

        $('#loading').remove();
        $('#components').append( componentsTpl ).find('.search').show();

        new List('components', {
            valueNames: [
                'name',
                'url'
            ],
            page: 9999
        });
    }

    $(function() {
        var url = 'http://bower.herokuapp.com/packages';

        $.ajax({
            url: 'http://jsonpify.heroku.com',
            type: 'GET',
            dataType: 'jsonp',
            cacheTTL: 24,
            localCache: true,
            data: {
                resource: url
            },
            success: render
        });
    });
})( window, jQuery );