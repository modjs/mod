var utils = require('../utils');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

exports.summary = 'Rename file with it hash value';

exports.usage = '<src> [options]';

exports.options = {

    "algorithm" : {
        alias : 'a'
        ,default : 'md5'
        ,describe : 'target build level'
    },
    "encoding" : {
        alias : 'e'
        ,default : 'hex'
        ,describe : 'file encoding type'
    }
};

exports.run = function (options) {

    var source =  options.src;
    var algorithm = options.algorithm;
    var encoding = options.encoding;

    var md5 = exports.rev(source, algorithm, encoding);

    if(md5){
        // slice 8 chars
        var rev = [md5.slice(0, 8), path.basename(source)].join('.');
        var renamePath = path.resolve(path.dirname(source), rev);
        // rename file
        fs.renameSync(source, renamePath);

        exports.log(source+ " > " + path.join(path.dirname(source), rev) );
    }

    // Return revved basename, not contains dir path
    return rev;
};

// http://nodejs.org/api/crypto.html
exports.rev = function(filepath, algorithm, encoding){

    algorithm = algorithm || 'md5';
    encoding = encoding || 'hex';

    var hash = crypto.createHash(algorithm);
    hash.update( exports.file.read(filepath, encoding));
    return hash.digest(encoding);
};
