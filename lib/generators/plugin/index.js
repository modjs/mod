var path = require('path');

exports.summary = 'jquery generator';

exports.options = {
    name: {
        message: 'Plugin name',
        default: "{{name}}",
        validator: /^[\w\-\.]+$/,
        warning: 'Must be only letters, numbers, dashes, dots or underscores.'
    }
};

exports.generators = {
    json: {
        dest: '.',
        data: {}
    },
    licenses: {
        dest: ".",
        data: {}
    },
    readme: {
        dest: ".",
        data: {}
    },
    git: {
        dest: ".",
        data: {}
    }
};

exports.run = function (options) {
    exports.copyTemplate('{{name}}.js');
};