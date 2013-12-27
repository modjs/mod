define(function(require){
    var a = require('./a');
    var $ = require('jquery');
    $('#hi').text(JSON.stringify(a));
});