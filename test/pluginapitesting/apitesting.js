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
    exports.log("exports Api Testing")
    assert.ok(exports.taskName)
    assert.ok(exports.template)
    assert.ok(exports.utils)
    assert.ok(exports.file)
    assert.ok(exports._)
    assert.ok(exports.async)
    assert.ok(exports.files)
    assert.ok(exports.loadTask)
    assert.ok(exports.runTask)
    assert.ok(exports.runTargets)
    assert.ok(exports.log)
    assert.ok(exports.debug)
    assert.ok(exports.error)
    assert.ok(exports.warn)
    assert.ok(exports.help)
    assert.ok(exports.request)
    assert.ok(exports.prompt)
}

exports.fileApiTesting = function(){
    exports.log("file Api Testing")
    var file = exports.file;
    assert.ok(file.exists)
    assert.ok(file.isFile)
    assert.ok(file.isPlaintextFile)
    assert.ok(file.isUTF8EncodingFile)
    assert.ok(file.suffix)
    assert.ok(file.isDir)
    assert.ok(file.isDirFormat)
    assert.ok(file.readJSON)
    assert.ok(file.findPackageJSON)
    assert.ok(file.readPackageJSON)
    assert.ok(file.listdir)
    assert.ok(file.glob)
    assert.ok(file.expand)
    assert.ok(file.delete)
    assert.ok(file.read)
    assert.ok(file.write)
    assert.ok(file.copy)
    assert.ok(file.find)
    assert.ok(file.mkdir)
    assert.ok(file.mkdirTemp)
    assert.ok(file.walkdir)
}

exports.templateApiTesting = function(){
    exports.log("template Api Testing")
    var template = exports.template
    assert.ok(template.registerHelper)
}

exports.utilsApiTesting = function(){
    exports.log("utils Api Testing")
    var utils = exports.utils
    assert.ok(utils.getHttpProxy)
    assert.ok(utils.isRelativeURI)
    assert.ok(utils.download)
    assert.ok(utils.isPlainObject)
    assert.ok(utils.clone)
    assert.ok(utils.walk)
    assert.ok(utils.namespace)
    assert.ok(utils.merge)
    assert.ok(utils.arrayify)
    assert.ok(utils.open)
}

