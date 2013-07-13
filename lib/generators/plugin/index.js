var path = require('path');

exports.summary = 'jquery generator';

exports.options = {
    main_name: {
        message: 'Plugin main module name',
        default: "index",
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
    git: {
        dest: ".",
        data: {}
    }
};

exports.run = function (options) {
    exports.copyTemplate('README.md');
    exports.copyTemplate('Modfile', "./test/Modfile", true, true);
    exports.copyTemplate('{{main_name}}.js');
};