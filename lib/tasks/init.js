var utils = require('../utils'),
    file = require('../utils/file'),
    format = require('../utils/format'),
    _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    ncp = require('ncp').ncp;


exports.summary = 'Generate a project skeleton in target directory';

exports.usage = '<project> [options]';

exports.options = {
    "t" : {
        alias : 'template'
        ,default: 'default'
        ,describe: 'destination template'
    },
    "d" : {
        alias : 'dest'
        ,default: '.'
        ,describe: 'target project directory'
    },
    "m" : {
        alias : 'modfile'
        ,tyep: 'Boolean'
        ,describe: 'only create a Modfile file in target directory'
    },
    "j" : {
        alias : 'json'
        ,tyep: 'Boolean'
        ,describe: 'only create a package.json file in target directory'
    },

    "c" : {
        alias : 'config'
        ,tyep: 'Boolean'
        ,describe: 'Both create Modfile and package.json in target directory'
    }
};

exports.run = function (opt, callback) {

    var project = opt.project,
        dest = opt.dest,
        template = opt.template;

    var templateDir =  path.resolve(__dirname, '../generators/' + template);
    var templateDate = {
        'project' : project,
        'Project' :  format.ucfirst(project)
    };

    if( file.exists(templateDir) ) {

        ncp(templateDir, dest, function(err){

            if(err){
                return callback(err);
            }

            dest = path.join(dest, "**/*");

            file.globSync(dest).forEach(function(inputFile){

                if(file.isFile(inputFile) && file.isPlaintextFile(inputFile)){
                    var contents = file.read(inputFile);
                    var result = format.template(contents ,templateDate);
                    file.write(inputFile, result);

                }

                exports.log(inputFile);

            });

            callback();

        });




    }else{
        // template plugins
        // TODO
    }

};
