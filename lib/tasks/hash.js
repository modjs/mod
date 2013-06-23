var utils = require('../utils'),
    fs = require('fs'),
    path = require('path'),
    crypto = require('crypto');

exports.summary = 'Rename file with it hash value';

exports.usage = '<source> [options]';

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


exports.run = function (options, done) {

    var source =  options.source;
    var algorithm = options.algorithm;
    var encoding = options.encoding;

    done = done || function(){};

    try {

        var md5 = exports.hash(source, algorithm, encoding);

        if(md5){
            // slice 8 chars
            var rev = [md5.slice(0, 8), path.basename(source)].join('.');
            var renamePath = path.resolve(path.dirname(source), rev);
            // rename file
            fs.renameSync(source, renamePath);

            exports.log(source+ " > " + rev );
        }

        done(null, rev);
        return rev;

    }catch (err){
        return done(err);
    }


};

// http://nodejs.org/api/crypto.html
exports.hash = function(filepath, algorithm, encoding){

    algorithm = algorithm || 'md5';
    encoding = encoding || 'hex';

    var hash = crypto.createHash(algorithm);
    hash.update( fs.readFileSync(filepath, encoding));

    return hash.digest(encoding);

};
