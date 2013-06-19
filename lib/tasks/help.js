var logger = require('../utils/logger');
var format = require('../utils/format');
var tasks = require('../tasks').getTasks();
var path = require('path');

exports.summary = 'Get help on mod';

exports.usage = '[command]';

exports.run = function (options, callback) {
    var args = process.argv.slice(2);
    var cmd = args[1];

    // gen docs
    if(cmd === '-d'){
        docs();
    }else{
        usage(cmd);
    }

    callback();
};


function usage(cmd) {

    if(cmd){
        try{
            return exports.loadTask(cmd).showHelp();
        }catch(e){
            exports.error(cmd,'not found');
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
    logger.clean_exit = true;
}


function docs(){

    var docTasksDir = path.resolve(__dirname, '../../doc/tasks/');

    var docTemplatePath = path.resolve(__dirname, '../../doc/template/task.md');
    var docTempalteContents = exports.file.read(docTemplatePath);
    var docTemplate = exports._.template(docTempalteContents);

    var readmeTemplatePath = path.resolve(__dirname, '../../doc/template/README.md');
    var readmeTempalteContents = exports.file.read(readmeTemplatePath);
    var readmeTempalte = exports._.template(readmeTempalteContents);

    var hrefBasePath = 'https://github.com/modulejs/modjs/tree/master/doc/tasks/';
    var readmeData = {
        'name' : 'Tasks',
        items: [] // {title:'',href:'', summary:''}
    };

    // generate tasks doc
    for (var k in tasks) {
        var task = tasks[k];
        task.taskName = k;

        var contents = docTemplate(task);
        var fpath = path.join(docTasksDir , k + '.md');
        exports.log(fpath);
        exports.file.write(fpath, contents);

        readmeData.items.push({title: k, href: require('url').resolve(hrefBasePath, k + '.md'), summary: task.summary});
    }

    // generate README.md
    var contents = readmeTempalte(readmeData);
    var fpath = path.join(docTasksDir , 'README.md');
    exports.log(fpath);
    exports.file.write(fpath, contents);

}

