exports.summary = 'my task';

exports.run = function (options, callback) {
    var text = options.text;
	exports.log(text);
    callback();
};
