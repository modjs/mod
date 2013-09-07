define([
    './var/$',
    './var/document',
    './var/navigator',
    './var/location',
    './syncModule'
], function ($, document, navigator, location, syncModule) {

    $('#foo').text(syncModule);
    
    $('#load').on('click', function(){
        require(['./asyncModule'], function(asyncModule){
            $('#bar').text(asyncModule);
        });
    })

})