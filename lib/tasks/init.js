var utils = require('../utils');
var file = require('../utils/file');
var format = require('../utils/format');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');

exports.summary = 'Generate project skeleton from template';

exports.usage = '<template> [options]';

exports.options = {
    "template" : {
        alias : 't'
        ,describe: 'destination template'
    },
    "dest" : {
        alias : 'd'
        ,default: '.'
        ,describe: 'target project directory'
    }
};

exports.run = function (options, done) {
    var template = options.template || options._[1] || '';
    var dest = options.dest;

    // TOOD: tempalting value should from promot
    var project = 'rename-me';
    var templateData = {
        'project' : project,
        'Project' :  format.ucfirst(project),
        // FIXME: set name as project name
        'name' : project
    };


    // TODO prompt template data
    var generators = [];
    var buildInGenerators = ['json', 'jquery', 'src', 'mocha', 'git', 'modfile', 'readme', 'plugin'];
    buildInGenerators.forEach(function(val){
        if(options._.indexOf(val) !== -1){
            generators.push(val);
        }
    });

    // check template existed
    var templateDir =  path.resolve(__dirname, '../generators/' + template);
    if( file.exists(templateDir) ) {
        generators.push( template );
    }else{
        return done(template + ' is not existed');
    }


    var tempDest = file.mkdirTemp();
    generators.forEach(function(val){
        var dir = path.resolve(__dirname, '../generators/'+ val);
        file.copy(dir, tempDest);
    });

    var tempDestPattern = path.join(tempDest, "**/*");
    file.glob(tempDestPattern).forEach(function(inputFile){

        if(file.isFile(inputFile) && file.isPlaintextFile(inputFile)){
            var contents = file.read(inputFile);
            var result = format.template(contents ,templateData);
            // filename or directory also could be naming as template format
            var outputFile = format.template(inputFile, templateData);

            if(inputFile !== outputFile){
                file.delete(inputFile);
            }
            file.write(outputFile, result);
            exports.log(path.relative(tempDest, outputFile));

        }else{
            exports.log(path.relative(tempDest, inputFile));
        }

    });

    // copy temp dir files to project dir
    file.copy(tempDest, dest);
    file.delete(tempDest);
    done();

};
