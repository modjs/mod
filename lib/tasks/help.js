var logger = require('../utils/logger');
var format = require('../utils/format');
var tasks = require('../builtin').getTasks();
var path = require('path');
var url =  require('url');

exports.summary = 'Get help on mod';

exports.usage = '[command]';

exports.run = function (options, done) {
    var args = process.argv.slice(2);
    var cmd = args[1];

    // gen docs
    if(cmd === '-d'){
        doc();
    }else{
        usage(cmd);
    }

    done();
};

function usage(cmd) {

    if(cmd){
        try{
            return exports.loadTask(cmd).help();
        }catch(e){
            exports.error(cmd, 'not found');
        }
    }

    console.log("Usage:");
    var usage = [' ','mod'.cyan, '<target>'.green , 'or'.grey , 'mod'.cyan, '<command>'.green,'[options]'.magenta];
    console.log( usage.join(" ") + "\n");

    console.log('Commands:');
    var len = format.longest(Object.keys(tasks));
    for (var k in tasks) {
        if (!tasks[k].hidden) {
            console.log(
                '  ' +  format.padRight(k, len).green  + '    ' + tasks[k].summary.grey
            );
        }
    }
}

function doc(){

    String.prototype.ucfirst = function(){
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

    String.prototype.lcfirst = function(str){
        return this.charAt(0).toLowerCase() + this.slice(1);
    };

    exports.log('Generate task doc...'.green);
    generateTasksDoc();
    exports.log('Generate api doc...'.green);
    generateApiDoc();
    exports.log('Generate README...'.green);
    generateReadme();
}

var readmeItems = [];

function generateReadme(){
    var docDir = path.resolve(__dirname, '../../doc/');
    var readmeTemplatePath = path.resolve(__dirname, '../../doc/template/README.md');
    var readmeTempalteContents = exports.file.read(readmeTemplatePath);
    var readmeTempalte = exports._.template(readmeTempalteContents);

    var readmeData = {
        name:"Documents",
        items: readmeItems
    };
    // generate README.md
    var contents = readmeTempalte(readmeData);
    var fpath = path.join(docDir , 'README.md');
    exports.log(fpath);
    exports.file.write(fpath, contents);

}

function generateTasksDoc(){

    var docDir = path.resolve(__dirname, '../../doc/tasks/');
    var docTemplatePath = path.resolve(__dirname, '../../doc/template/task.md');
    var docTempalteContents = exports.file.read(docTemplatePath);
    var docTemplate = exports._.template(docTempalteContents);

    var readmeTemplatePath = path.resolve(__dirname, '../../doc/template/README-task.md');
    var readmeTempalteContents = exports.file.read(readmeTemplatePath);
    var readmeTempalte = exports._.template(readmeTempalteContents);

    var hrefBasePath = 'https://github.com/modulejs/modjs/tree/master/doc/tasks/';
    var readmeData = {
        name : 'Tasks',
        items: [] // {title:'',href:'', summary:''}
    };

    // generate tasks doc
    for (var k in tasks) {
        var task = tasks[k];
        task.taskName = k;

        var contents = docTemplate(task);
        var fpath = path.join(docDir , k + '.md');
        exports.log(fpath);
        exports.file.write(fpath, contents);

        readmeData.items.push({title: k, href: url.resolve(hrefBasePath, k + '.md'), summary: task.summary});
    }

    // generate README.md
    var contents = readmeTempalte(readmeData);
    var fpath = path.join(docDir , 'README.md');
    readmeItems.push(contents);
    exports.log(fpath);
    exports.file.write(fpath, contents);

}

function generateApiDoc(){

    var docDir = path.resolve(__dirname, '../../doc/api/');
    var docTemplatePath = path.resolve(__dirname, '../../doc/template/api.md');
    var docTempalteContents = exports.file.read(docTemplatePath);
    var docTemplate = exports._.template(docTempalteContents);

    var readmeTemplatePath = path.resolve(__dirname, '../../doc/template/README-api.md');
    var readmeTempalteContents = exports.file.read(readmeTemplatePath);
    var readmeTempalte = exports._.template(readmeTempalteContents);

    var hrefBasePath = 'https://github.com/modulejs/modjs/tree/master/doc/api/';

    var readmeData = {
        name : 'API',
        items: [] // {title:'',href:'', summary:''}
    };
    var sourceDir = path.resolve(__dirname, '../../lib/');
    // source files
    var sourceFiles = ['runner.js', 'utils/file.js','utils/index.js', 'utils/template.js'];

    sourceFiles.forEach(function(filepath){
        var source = exports.file.read( path.join(sourceDir, filepath) );
        var module = apiScan(source);
        var contents = docTemplate(module);
        var fpath = path.join(docDir , module.name + '.md');
        exports.log(fpath);
        exports.file.write(fpath, contents);
        // console.log(module)
        readmeData.items.push({title: module.name, href: url.resolve(hrefBasePath, module.name + '.md'), summary: module.summary});
    });

    // generate README.md
    var contents = readmeTempalte(readmeData);
    readmeItems.push(contents);
    var fpath = path.join(docDir , 'README.md');
    exports.log(fpath);
    exports.file.write(fpath, contents);

}

// {desc:"", name: "", return: "", example: ""}
function apiFactory(name, desc, ret, example, type){
    return {describe:desc, name:name, ret:ret, example: example, type: type}
}

function apiScan(source){
    var result,
        comment,
        desc,
        name,
        ret,
        example,
        type,
        methods = [],
        properties = [];

    var moduleName = '';
    var moduleSummary = '';

    var pattern = /\/\*(.|\s)*?\*\//mg;
    var methodPattern = /@method\s+(.*)/;
    var modulePattern = /@module\s+(.*)/;
    var summaryPattern = /@summary\s+(.*)/;
    var propertyPattern = /@property\s+(.*)/;
    var returnPattern = /@return\s+(.*)/;
    var mPattern = /\* (.*)/g;
    var mpPattern = /\* */g;

    while((result = pattern.exec(source)) != null) {
        //console.log("Matched '" + result[0] +
        //     "' at position " + result.index +
        //     " next search begins at position " + pattern.lastIndex);

        comment = result[0];

        if(/@module/ig.test(comment)){
            moduleName = comment.match(modulePattern)[1];
            moduleSummary = comment.match(summaryPattern)[1];
        };


        var isPrivate = /@private/ig.test(comment);
        var isPublicMethod = /@method/ig.test(comment);
        var isPublicProperty = /@property/ig.test(comment);
        if(!isPrivate && (isPublicMethod || isPublicProperty)){

            if(isPublicMethod){
                desc = comment.split("@method")[0];
                desc = desc.match(mPattern).join("").replace(mpPattern,"");
                type = 'method';
                name = comment.match(methodPattern)[1];

            }else if(isPublicProperty){
                desc = comment.split("@property")[0];
                desc = desc.match(mPattern).join("").replace(mpPattern,"");
                type = 'property';
                name = comment.match(propertyPattern)[1];
            }

            if(ret = comment.match(returnPattern)){
                ret = ret[1];
            }

            if(example = comment.split("@example")[1]){
                var mexample;
                if(mexample = example.match(mPattern)){
                    example = mexample.join("\n").replace(/\*\s{0,2}/g,"");
                }
            }


            var api = apiFactory(name, desc, ret, example, type);
            if(isPublicMethod){
                methods.push(api);
            }else{
                properties.push(api);
            }

        }

    }

    return {name: moduleName, summary: moduleSummary, properties: properties, methods: methods};
}
