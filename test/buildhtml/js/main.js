// Require.js allows us to configure shortcut alias
require.config({
    paths: {
        $   : './$'
    }
});

require([
    '$'
], function ($) {
    console.log($);
})