var assert = require('assert');

exports.summary = 'Unit testing for Mod.js API';

exports.run = function (options, done) {
    exports.exportsApiTesting();
    exports.fileApiTesting();
    exports.utilsApiTesting();
    exports.templateApiTesting();
    done();
};

exports.exportsApiTesting = function(){
    assert.ok(exports.taskName)
}

exports.fileApiTesting = function(){
    assert.ok(exports.file)
}

exports.utilsApiTesting = function(){
    assert.ok(exports.utils)
}

exports.templateApiTesting = function(){
    assert.ok(exports.template)
}


