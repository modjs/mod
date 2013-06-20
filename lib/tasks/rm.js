exports.summary = 'Remove files';

exports.usage = '<target>';

exports.run = function (options, callback) {
    // options
    var target = options.target;

    var targets = exports.utils.arrayify(target);

    targets.forEach(function(target){
        exports.file.delete(target);
        exports.log(target);
    });

    callback();

};
