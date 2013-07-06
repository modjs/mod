var utils = require('../utils');
var file = require('../utils/file');
var format = require('../utils/format');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var async = require('async');

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

    var template = options.template || options._[1];
    var dest = options.dest;
    
    var exec = require('child_process').exec;
    async.series({
        name: function(callback){
            exec('git config --get user.name',function(error, stdout, stderr){
                callback(null, stdout.trim());
            });
        },
        email: function(callback){
            exec('git config --get user.email',function(error, stdout, stderr){
                callback(null, stdout.trim());
            });
        },
        user: function(callback){
            exec('git config --get github.user',function(error, stdout, stderr){
                callback(null, stdout.trim());
            });
        },
    },
    function(err, results) {
        // results is now equal to: {one: 1, two: 2}
        // console.log(results);

        exports.runGenerator(template, dest);
        done();
    });
};

exports.copyTemplate = function(templateDir, destDir, data, src, dest){

    var srcPattern = path.resolve(templateDir, src);
    if(file.isDirFormat(srcPattern)) srcPattern = [path.join(srcPattern, "**/.*"), path.join(srcPattern, "**/*")];
    file.glob(srcPattern).forEach(function(inputFile){
        if( !file.exists(inputFile) ) return;
        // filename or directory also could be naming as template format
        var to = format.template(path.relative(templateDir, inputFile), data);
        to = path.join(dest, to);
        
        if(file.isFile(inputFile) && file.isPlaintextFile(inputFile)){
            var contents = file.read(inputFile);
            var result = format.template(contents, data);
            file.write( path.resolve(destDir, to), result);
        }else{
            file.copy(inputFile, path.resolve(destDir, to));
        }
        console.log(['Writing', to.green, 'OK'].join(' '));
    });
};

exports.runGenerator = function(template, dest){
    // check template existed
    var generators = [];  

    var templateDir;
    var buildInGenerators = ['json', 'jquery', 'src', 'mocha', 'git', 'modfile', 'readme', 'plugin'];
    if( buildInGenerators.indexOf(template) > -1){
        templateDir =  path.resolve(__dirname, '../generators/' + template);
    }else{
        // custom generator
        templateDir = path.resolve(__dirname, '../../../mod-init-' + template);
    }

    if( !file.exists(templateDir) ) {
        return done(template + ' is not existed');
    }

    try{
        var generator = require(templateDir);
        console.log(['\nNote:',
            'press',
            '"ENTER"'.green,
            'key will use the default value and answering',
            '"none"'.green,
            'will leave its value blank.\n'].join(" "));

        var prompt = require('prompt');
        prompt.message = '[' + '?'.green + ']';
        prompt.delimiter = ' ';

        // Add one final "are you sure?" prompt.
        var options = generator.options;
        if (Object.keys(options).length > 0) {
            console.log(['Generator', ('"'+template+'"').green, 'needs answer the following question:'].join(' '));
            options['ANSWERS_VALID'] = {
                message: 'Do you need to make any changes to the above before continuing?'.green,
                default: 'y/N'
            };
            // Start the prompt
            prompt.start();
            (function prompts(){
                prompt.get( {properties: options}, function(err, result){
                    // After all prompt questions have been answered...
                    if (result && /n/i.test(result['ANSWERS_VALID'])) {
                        // User accepted all answers. Suspend prompt.
                        prompt.pause();
                        delete result['ANSWERS_VALID'];
                        console.log('\n');
                        generator.runGenerator = exports.runGenerator;
                        generator.copyTemplate = exports.copyTemplate.bind(null, templateDir, dest, result);
                        generator.run(result);
                    }
                    else if(result) prompts();
                })
            })();
        }else {
            console.log(['Generator',('"'+template+'"').green, ':'].join(' '));
            generator.runGenerator = exports.runGenerator;
            generator.copyTemplate = exports.copyTemplate.bind(null, templateDir, dest, result);
            generator.run(result);
        }

        return;
    }catch(e){
        // throw e;
    }

    console.log(['Generator',('"'+template+'"').green, ':'].join(' '));
    exports.copyTemplate(templateDir, dest, {}, '.', '.');
};
