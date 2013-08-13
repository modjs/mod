var utils = require('../utils');

exports.summary = 'Remove files';

exports.usage = '<dest>';

exports.run = function (options) {

    var dest = options.dest || options.target;
    var paths = utils.arrayify(dest);

    paths.forEach(function(pathname){
        exports.file.delete(pathname);
        exports.log(pathname);
    });

};
