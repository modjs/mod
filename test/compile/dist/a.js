
define('c',['require'],function (require) {
    //require('jquery');
    return {};
});
define('b',['require','./c'],function (require) {
    require('./c');
    return {};
});
define('a.js',['require','./b'],function (require) {
    require('./b');
    return {"作者":"元彦","version": VERSION};
});