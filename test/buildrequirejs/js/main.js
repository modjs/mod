// Require.js allows us to configure shortcut alias
require.config({
    paths: {
        $   : './$'
    }
});

require([
    '$'
], function ($) {
    $('#id').text("Hello ModJS");
})