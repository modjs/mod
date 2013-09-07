
define('var/$',[],function(){
    return Zepto;
});
define('var/document',[],function(){
    return window.document;
});
define('var/navigator',[],function(){
    return window.navigator;
});
define('var/location',[],function(){
    return window.location;
});
/* sync Module */
define('syncModule',['./var/navigator'],function(navigator){
    return "sync Module loaded"
});
define('main',[
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

});