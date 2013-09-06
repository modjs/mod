define([
    './var/$',
    './var/document',
    './var/navigator',
    './var/location',
    './syncModule'
], function ($, document, navigator, location, syncModule) {

    $('#foo').text(syncModule);
    
    require(['./asyncModule'], function(asyncModule){
        $('#bar').text(asyncModule);
    });
})