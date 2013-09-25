var path = require('path');

exports.summary = 'jquery generator';

exports.options = {
    name: {
        message: 'Project name',
        default: function () {
            var types = ['javascript', 'js'];
            var type = '(?:' + types.join('|') + ')';
            // This regexp matches:
            //   leading type- type. type_
            //   trailing -type .type _type and/or -js .js _js
            var re = new RegExp('^' + type + '[\\-\\._]?|(?:[\\-\\._]?' + type + ')?(?:[\\-\\._]?js)?$', 'ig');
            // Strip the above stuff from the current dirname.
            var name = path.basename(process.cwd()).replace(re, '');
            // Remove anything not a letter, number, dash, dot or underscore.
            return name.replace(/[^\w\-\.]/g, '');
        },
        validator: /^[\w\-\.]+$/,
        warning: 'Must be only letters, numbers, dashes, dots or underscores.'
    },
    description: {
        message: 'Project description',
        default: '{{name}}'
    },
    author_name: {
        message: 'Author name',
        default: process.env.USER || process.env.USERNAME
    }
};

exports.generators = {
    modfile: {
        dest: ".",
        data: {}
    }
};

exports.run = function (options) {
    exports.copyTemplate('index.html');
    exports.copyTemplate('main.css', 'css/main.css');
    exports.copyTemplate('main.js', 'js/main.js');
};
