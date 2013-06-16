var utils = require('../utils'),
    file = require('../utils/file'),
    format = require('../utils/format'),
    _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    ncp = require('ncp').ncp;

exports.summary = 'Generate project skeleton from templates';

exports.usage = '[project] [options]';

exports.options = {
    "project" : {
        alias : 'p'
        ,describe: 'project name'
    },
    "template" : {
        alias : 't'
        ,describe: 'destination template'
    },
    "dest" : {
        alias : 'dest'
        ,default: '.'
        ,describe: 'target project directory'
    },
    "mod" : {
        type: 'Boolean'
        ,describe: 'create a mod files in target directory'
    },
    "json" : {
        type: 'Boolean'
        ,describe: 'create a package.json file in target directory'
    },
    "git" : {
        type: 'Boolean'
        ,describe: 'create git files in target directory'
    },
    "readme" : {
        type: 'Boolean'
        ,describe: 'create a README.md file in target directory'
    },
    "mocha" : {
        type: 'Boolean'
        ,describe: 'create test files in target directory'
    }
};

exports.run = function (options, callback) {

    var project = options.project || options._[1] || '',
        dest = options.dest,
        template = options.template;

    var templateData = {
        'project' : project,
        'Project' :  format.ucfirst(project),
        // FIXME: set name as project name
        'name' : project
    };

    // TODO prompt template data

    var generators = [];
    var baseGenerators = ['json', 'mocha', 'git', 'mod', 'readme'];
    var isCustomBaseGenerators = false;
    baseGenerators.forEach(function(val){
        if(options[val]){
            generators.push(val);
            isCustomBaseGenerators = true;
        }

    });

    if(!isCustomBaseGenerators) {
        generators = baseGenerators;
    }

    if(template){
        // check template existed
        var templateDir =  path.resolve(__dirname, '../generators/' + template);
        if( file.exists(templateDir) ) {
            generators.push( template );
        }else{
            return callback(template + ' is not existed');
        }
    }


    var parallelTasks = [];

    generators.forEach(function(val){
        var dir = path.resolve(__dirname, '../generators/'+ val);
        parallelTasks.push( ncp.bind(this, dir, dest) );
    });


    // console.log(options, generators, parallelTasks);
    exports.async.parallel(parallelTasks, function(err){

        if(err){
            return callback(err);
        }

        dest = path.join(dest, "**/*");

        file.globSync(dest).forEach(function(inputFile){

            if(file.isFile(inputFile) && file.isPlaintextFile(inputFile)){
                var contents = file.read(inputFile);
                var result = format.template(contents ,templateData);
                // filename or directory also could be naming as template format
                var outputFile = format.template(inputFile, templateData);
                file.write(outputFile, result);
            }

            exports.log(inputFile);

        });

        callback();

    });


};
