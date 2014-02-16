exports.summary = "{{description}}";

exports.options = {
    src: {
        describe: "source file"
    },
    dest: {
        default: "<src>"
        ,describe: "destination file"
    },
    charset: {
        default: "utf-8"
        ,describe: "file encoding type"
    }
};

exports.run = function (options) {
    var src = options.src;
    var dest = options.dest;
    var charset = options.charset;

    exports.log("it's work!");
};
