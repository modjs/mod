var path = require('path');

exports.summary = 'jquery generator';

exports.options = {
    demo: {
        message: 'Demo URL',
        default: ''
    },
    docs: {
        message: 'Docs URL',
        default: ''
    },
    jquery_version: {
        message: 'Required jQuery version',
        default: '*'
    },
    author_name: {
        message: 'Author name',
        default: process.env.USER || process.env.USERNAME
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
    modfile: {
        dest: ".",
        data: {}
    },
    git: {
        dest: ".",
        data: {}
    },
    readme: {
        dest: ".",
        data: {}
    }
};

exports.run = function (options) {
    exports.copyTemplate('{{name}}.jquery.json');
    exports.copyTemplate('{{name}}.js');
};
