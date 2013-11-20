var utils = require('../utils');
var file = require('../utils/file');
var format = require('../utils/format');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var async = require('async');
var EventEmitter = require('events').EventEmitter;
var processTemplate = require('../config').processTemplate;

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

    if(!template) {
        return done();
    }

    var exec = require('child_process').exec;
    async.series({
        author_name: function(callback){
            exec('git config --get user.name',function(error, stdout, stderr){
                callback(null, stdout.trim());
            });
        },
        author_email: function(callback){
            exec('git config --get user.email',function(error, stdout, stderr){
                callback(null, stdout.trim());
            });
        },
        user: function(callback){
            exec('git config --get github.user',function(error, stdout, stderr){
                callback(null, stdout.trim());
            });
        }
    },
    function(err, results) {
        // init state
        ranGenerator = {};
        console.log(['Note:\n',
            '1. Press',
            '"ENTER"'.green,
            'key will use the default value.\n',
            '2. Answering',
            '"none"'.green,
            'will leave its value blank.\n',
            '3. Press',
            '"Ctrl+D"'.green,
            'to exit the input.'].join(" "));
        // results is now equal to: {name: 1, email: 2...}
        // console.log(results);
        exports.runGenerator(template, dest, results, done);
    });
};

var ranGenerator = {};
var templateData = exports.templateData = {};

exports.copyTemplate = function(templateDir, destDir, data, src, dest, isSrcFile, isDestFile){
    data = processTemplate(data);
    dest = dest || "."; //dest could be null, defualt is target root dir
    var srcPattern = path.resolve(templateDir, src);
    if(!isDestFile && file.isDirname(srcPattern)) srcPattern = [path.join(srcPattern, "**/.*"), path.join(srcPattern, "**/*")];

    file.glob(srcPattern).forEach(function(inputFile){
        if( !file.exists(inputFile) ) return;
        // filename or directory also could be naming as template format
        var to = format.template(path.relative(templateDir, inputFile), data);
        if(!isDestFile && file.isDirname(dest))
            to = path.join(dest, to);
        else
            to = dest;

        var outputFile = path.resolve(destDir, to);
        if( file.exists(outputFile) ){
            var renamed = file.suffix(outputFile, +new Date);
            file.rename(outputFile, renamed);
            console.log( ['Renaming existed file', ('"' + path.relative(destDir, outputFile) + '"').yellow, '>>'.green, ('"' + path.relative(destDir, renamed) + '"').yellow, 'OK...'].join(' '));
        }

        if(file.isFile(inputFile) && file.isPlaintextFile(inputFile)){
            var contents = file.read(inputFile);
            var result = format.template(contents, data);
            file.write( outputFile, result);
        }else{
            file.copy(inputFile, outputFile);
        }
        console.log(['Writing', ('"' + to  + '"').green, 'OK...'].join(' '));
    });
};

exports.runGenerator = function(template, dest, data, done){

    templateData = _.extend(templateData, data);
    // check if built-in template existed
    var templateDir =  path.resolve(__dirname, '../generators/' + template);;

    if( !file.exists(templateDir) ){
        // check custom generator
        templateDir = path.resolve(__dirname, '../../../mod-generator-' + template);

        if( !file.exists(templateDir) ) {
            return done('Template ' + template + ' does not exists');
        }
    }

    try{
        var generator = require(templateDir);
    }catch(e){
        exports.debug(e)
    }

    // ran flag
    ranGenerator[template] = true;

    if(generator){

        var generators = [];
        var depGenerators = generator.generators;
        if(depGenerators){
            Object.keys(depGenerators).forEach(function(template){
                generators.push(function(done){
                    // check going?
                    if(ranGenerator[template]) return done();
                    ranGenerator[template] = true;
                    // go
                    var params = generator.generators[template];
                    exports.runGenerator( template, params.dest, params.data, function(){
                        params.done && params.done();
                        done();
                    });
                });
            });
        }

        generators.push(function(done){
            // events extend
            _.extend(generator, new EventEmitter);
            var options = generator.options;

            if (Object.keys(options).length > 0) {
                var prompt = require('prompt');
                prompt.message = '[' + '?'.green + ']';
                prompt.delimiter = ' ';

                console.log(['\nGenerator', ('"'+template+'"').green, 'needs answer the following question:'].join(' '));

                // Add one final "are you sure?" prompt.
                options['PROMPTS_COMFIRM'] = {
                    message: 'Do you need to make any changes to the above before continuing?'.green,
                    default: 'y/N'
                };
                // Start the prompt
                prompt.start();

                (function prompts(){
                    var promptSeries = {};
                    Object.keys(options).map(function(key){
                        promptSeries[key] = function(callback){
                            var properties = {};
                            var option = options[key];
                            properties[key] = option;
                            // process option setting
                            if(_.isFunction(option.default)) option.default = option.default(templateData);
                            option.default = option.default ?
                            format.template(option.default, templateData) :
                            templateData[key];
                            // get input
                            prompt.get( {properties: properties}, function(err, result){
                                templateData = _.extend(templateData, result);

                                if(result && result[key] == "none"){
                                    templateData[key] = '';
                                }
                                callback(null, result && result[key]);
                            });
                        }
                    });

                    async.series( promptSeries, function(err, results){
                        // After all prompt questions have been answered...
                        if (results && /n/i.test(templateData['PROMPTS_COMFIRM'])) {
                            // User accepted all answers. Suspend prompt.
                            prompt.pause();
                            delete templateData['PROMPTS_COMFIRM'];
                            console.log('');
                            generator.copyTemplate = exports.copyTemplate.bind(generator, templateDir, dest, templateData);
                            generator.templateData = exports.templateData;
                            if(generator.run.length<2){
                                generator.run(templateData);
                                done();
                            }else
                                generator.run(templateData, done);
                        }
                        else if(results) prompts();
                    });
                })();


            }else{
                console.log(['\nGenerator',('"'+template+'"').green, ':'].join(' '));
                generator.copyTemplate = exports.copyTemplate.bind(generator, templateDir, dest, templateData);
                generator.templateData = exports.templateData;
                if(generator.run.length<2){
                    generator.run(templateData);
                    done();
                }else
                    generator.run(templateData, done);
            }
        });

        async.series(generators, done);

    }else{
        console.log(['\nGenerator',('"'+template+'"').green, ':'].join(' '));
        exports.copyTemplate(templateDir, dest, templateData, '.', '.');
        done();
    }

};
