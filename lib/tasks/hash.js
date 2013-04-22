var utils = require('../utils'),
    fs = require('fs'),
    path = require('path'),
    crypto = require('crypto');

exports.summary = 'Rename file with it hash value';

exports.usage = '<source> [options]';

exports.options = {

    "a" : {
        alias : 'algorithm'
        ,default : 'md5'
        ,describe : 'target build level'
    },
    "e" : {
        alias : 'encoding'
        ,default : 'hex'
        ,describe : 'file encoding type'
    }
};


exports.run = function (options, callback) {


    var source =  options.source,
        algorithm = options.algorithm,
        encoding = options.encoding;

    try {

        var md5 = task(source, algorithm, encoding);

        if(md5){
            // slice 8 chars
            var rev = [md5.slice(0, 8), path.basename(source)].join('.');
            var renamePath = path.resolve(path.dirname(source), rev);
            // rename file
            fs.renameSync(source, renamePath);

            exports.log(source+ " > " + rev );
        }

        callback && callback(null, rev);
        return rev;

    }catch (err){
        return callback && callback(err);
    }


};

// http://nodejs.org/api/crypto.html
var task = exports.task = function(filepath, algorithm, encoding){

    algorithm = algorithm || 'md5';
    encoding = encoding || 'hex';

    var hash = crypto.createHash(algorithm);
    hash.update( fs.readFileSync(filepath, encoding));

    return hash.digest(encoding);

};
