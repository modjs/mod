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

    assert.ok(exports.notify)
    exports.notify('OK');
    exports.notify({
        title: "Title",
        message: "message"
    });

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
    assert.ok(file.isDirname)
    assert.ok(file.readJSON)
    assert.ok(file.findPackageJSON)
    assert.ok(file.readPackageJSON)
    assert.ok(file.listdir);

    assert.ok(file.glob);
    assert.deepEqual(file.glob("."), ["."]);
    assert.deepEqual(file.glob("./"), ["./"]);
    assert.deepEqual(file.glob("/"), ["/"]);

    assert.ok(file.expand);
    assert.deepEqual(file.expand("."), ["."]);
    assert.deepEqual(file.expand("./"), ["./"]);
    assert.deepEqual(file.expand("/"), ["/"]);

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
    assert.ok(utils.download)
    assert.ok(utils.open) 

    assert.ok(utils.walk)
    utils.walk( {foo: { bar:{ baz:1 } }}, function(val){
        assert.equal(val, 1)
    })

    assert.ok(utils.merge)
    assert.deepEqual(utils.merge( {foo:1}, {bar: 2} ), {foo:1, bar:2})

    assert.ok(utils.namespace)
    assert.equal(utils.namespace( {foo: { bar:{ baz:1 } }}, 'foo.bar.baz' ), 1)
    
    assert.ok(utils.arrayify);
    assert.deepEqual(utils.arrayify(1), [1])
    assert.deepEqual(utils.arrayify(), [])
    assert.deepEqual(utils.arrayify(null), [null])
    assert.deepEqual(utils.arrayify(undefined), [undefined])
    assert.deepEqual(utils.arrayify('1'), ['1'])
    assert.deepEqual(utils.arrayify(1,2,3), [1,2,3])
    assert.deepEqual(utils.arrayify('1','2','3'), ['1','2','3'])
    assert.deepEqual(utils.arrayify('1,2,3'), ['1','2','3'])
    assert.deepEqual(utils.arrayify('1, 2, 3'), ['1','2','3'])
    assert.deepEqual(utils.arrayify(' 1 , 2 , 3 '), ['1','2','3']);
    (function() {
        assert.deepEqual(utils.arrayify(arguments), [1,2]) // => [1, 2]
    })(1, 2);

    assert.ok(utils.clone)
    assert.equal(utils.clone("123"), 123); 
    assert.deepEqual(utils.clone({foo: 1, bar:2}), {foo: 1, bar:2}); 

    assert.ok(utils.isPlainObject)
    assert.equal(utils.isPlainObject("123"), false); 
    assert.equal(utils.isPlainObject({}), true); 
    assert.equal(utils.isPlainObject(new Object), true); 
    assert.equal(utils.isPlainObject(new Error), false); 

    assert.ok(utils.isRelativeURI)
    assert.equal(utils.isRelativeURI("../path/to"), true); // => return true
    assert.equal(utils.isRelativeURI("path/to"), true); // => return true
    assert.equal(utils.isRelativeURI("http://www.qq.com"), false); // => return false
    assert.equal(utils.isRelativeURI("/relative/to/root"), false); // => return false
    assert.equal(utils.isRelativeURI("//without/protocol"), false); // => return false
    assert.equal(utils.isRelativeURI("data:image/gif;base64,lGODlhEAA..."), false); // => return false
}

