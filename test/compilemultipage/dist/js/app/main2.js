
define('app/controller/c2',['./Base'], function (Base) {
    var c2 = new Base('Controller 2');
    return c2;
});

define('app/model/m2',['./Base'], function (Base) {
    var m2 = new Base('This is the data for Page 2');
    return m2;
});

define('app/main2',['require','jquery','./lib','./controller/c2','./model/m2'],function (require) {
    var $ = require('jquery'),
        lib = require('./lib'),
        controller = require('./controller/c2'),
        model = require('./model/m2');

    //A fabricated API to show interaction of
    //common and specific pieces.
    controller.setModel(model);
    $(function () {
        controller.render(lib.getBody());
    });
});
