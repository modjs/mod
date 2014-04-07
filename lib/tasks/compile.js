var path = require('path');
var _ = require('lodash');
var utils = require('../utils');
var logger = require('../utils/logger');
var file = require('../utils/file');

exports.summary = 'Compile JavaScript/CSS/HTML source';

exports.usage = '<src> [options]';

exports.options = {
    "dest" : {
        alias : 'd'
        ,default : './dist'
        ,describe : 'Output file for the compiled code'
    },

    "charset" : {
        alias : 'c'
        ,default : 'utf-8'
        ,describe : 'File encoding type'
    },

    "conditional": {
        default: true
        ,describe: "Activates conditional compilation."
    },

    "variables" : {
        default : {
            target: "default"
        }
        ,describe : 'Variables are available for conditional compilation'
    },

    "suffix" : {
        describe : 'The output file suffix'
    },

    'output': {
        alias: 'o'
        ,default : 'file'
        ,describe : 'Specify output type: file or pipe'
    },

    "loader" : {
        describe : 'The Modules Loader [JS only]'
    },

    "baseUrl" : {
        default: '.'
        ,describe : 'All modules are located relative to this path [JS only]'
    },

    "mainFile": {
        describe: "The main file [JS only]"
    },

    "mainConfigFile" : {
        describe: "Specify the file of the configuration for optimization [JS only]"
    },

    "exclude" : {
        describe : 'Deep excludes a module and it\'s dependencies from the build [JS only]'
    },

    "excludeShallow" : {
        describe : 'Shallow excludes a module from the build (it\'s dependencies will still be included) [JS only]'
    },

    "packageDir" : {
        describe : 'Modules directory to use [JS only]'
    },

    "asciiOnly" : {
        default: true
        ,type : 'boolean'
        ,describe: "Ascii encoding only [JS only]"
    },

    'combine' : {
        describe : 'Combine require modules if existed [JS only]'
        ,default : true
        ,type : 'boolean'
    },

    "stripDefine" : {
        default: false
        ,describe: "Strip all definitions in generated source [requirejs only]"
    },

    "miniLoader" : {
        describe : 'Use the lighweight almond shim instead of RequireJS, smaller filesize but can only load bundled resources and cannot request additional modules [requirejs only]'
    },

    "includeLoader":{
        describe : 'If include module loader [requirejs only]'
        ,default : false
        ,type : 'boolean'
    },

    "verbose" : {
        default: true
        ,describe : 'Increase log level to report all compiled modules [requirejs only]'
    },

    "wrap" : {
        default : false
        ,describe : 'Wraps the output in an anonymous function to avoid require and define functions being added to the global scope, this often makes sense when using the almond option. [requirejs only]'
    },

    "minify" : {
        describe : 'If minify concatenated file with UglifyJS [requirejs only]'
        ,default : false
        ,type : 'boolean'
    },

    "license" : {
        describe : 'If include license comments [requirejs only]'
        ,default : false
        ,type : 'boolean'
    },

    "stubModules": {
        describe: "Specify modules to stub out in the optimized file [requirejs only]"
    },

    'idleading':{
        describe : 'Prepend idleading to generate the id of the module. [seajs only]'
        ,default : ''
        ,type : 'string'
    },

    "alias" : {
        describe: "Modules root path [seajs only]"
        ,default : {}
        ,type : 'object'
    },

    "paths" : {
        describe: "Where are the modules in the sea. [seajs only]"
        ,default : ['sea-modules']
        ,type : 'array'
    },

    "format": {
        describe: "id format, like hello/dist/{{filename}}. [seajs only]"
        ,type : 'string'
    },

    "debug" : {
        describe: "Create a debugfile or not. [seajs only]"
        ,default : true
        ,type : 'boolean'
    }

};


exports.run = function (options, done) {

    var dest = options.dest;
    var conditional = options.conditional;
    var variables = options.variables;
    var output = options.output;
    var suffix = options.suffix;
    var charset = options.charset;
    var loader =  options.loader;

    options.src = options.src || options.source;

    // custom compile process
    var compile = options.compile;

    // TODO
    var precompile = options.precompile;
    var postcompile = options.postcompile;

    done = done || function(){};

    // The contents of the compiled file
    var contents;
    var isAsync;

    exports.files.forEach(function(inputFile){
        var outputFile;
        if(output === 'file'){
            outputFile = file.outputFile(inputFile, dest, suffix, ".compiled");
        }

        // custom compiler should be put first
        if( typeof compile === 'function' ){

            var origin = file.read(inputFile);
            // Custom Compile Example:
            // function (origin) { return Handlebars.precompile(origin)}
            contents = compile(origin);

        }else if(loader){

            if(options.combine){
                if(loader == "requirejs"){
                    // TODO: should process that in optimist
                    options.exclude = options.exclude && utils.arrayify(options.exclude);
                    options.excludeShallow = options.excludeShallow && utils.arrayify(options.excludeShallow);
                    // AMD modules compile is async
                    isAsync = true;
                    return exports.compileRequireJS(inputFile, outputFile, options, done);

                }else if(loader == "seajs"){
                    // mod compile a.js,b.js
                    contents =  exports.compileSeaJS(inputFile, options);
                }else{
                    exports.error('Unsupported modules loader: ' + loader);
                }

            }else{

                // mod compile *.js -c false
                var uglifyjs = require('uglify-js');
                var jsp = uglifyjs.parser;
                var pro = uglifyjs.uglify;
                var ast;

                var input = file.read(inputFile);
                var opt = {
                    except: ['require'],
                    ascii_only: options.asciiOnly
                };
                ast = jsp.parse(input);
                ast = pro.ast_mangle(ast, opt); // except require
                ast = pro.ast_squeeze(ast, opt);
                contents = pro.gen_code(ast, opt);
            }

        }else if(conditional){
            // compile html/css comment directives
            contents = exports.conditionalCompile(inputFile, variables, charset);
        }

        if(outputFile){
            file.write(outputFile, contents, charset);
            exports.log(inputFile, '>', outputFile);
        }
    });

    if(!isAsync){
        done(null, contents);
        return contents;
    }

};

/**
 * conditional comment directives
 */
exports.conditionalCompile = function(inputFile, variables, charset){

    var delimiterHead, delimiterHead2, delimiterEnd, delimiterSign, backRef;
    var ext = path.extname(inputFile);
    if( ext === '.css' || ext === '.js'){
        // CSS/JS conditional comment
        delimiterHead = "/\\*";
        delimiterHead2 = delimiterHead;
        delimiterEnd = "\\*/";
        delimiterSign = "/";
        backRef = "$1";
    } else if ( ext === '.html' ){
        // HTML conditional comment
        delimiterHead = "<!--";
        delimiterHead2 = "<!--(<!)?";
        delimiterEnd = "-->";
        delimiterSign = ">(<!-->)?";
        backRef = "$2";
    }

    var contents = file.read(inputFile, charset);
    if(contents) {
        _.each(variables, function(val, name){
            var targetRegStr = delimiterHead + '\\s*\\(?\\s*#?if\\s+@?'+ name +'\\s+' + val + '\\s*\\)?\\s*'+ delimiterSign +'([\\s\\S]*?)'+ delimiterHead2 +'\\s*\\(?\\s*#?endif\\s*\\)?\\s*'+ delimiterEnd;
            var otherTargetRegStr = delimiterHead + '\\s*\\(?\\s*#?if\\s+@?' + name + '\\s+.*?\\)?\\s*'+ delimiterSign +'([\\s\\S]*?)'+ delimiterHead2 +'\\s*\\(?\\s*#?endif\\s*\\)?\\s*'+ delimiterEnd + '[\r\n]*';
            // strip comments and keep target code
            contents = contents.replace(new RegExp(targetRegStr, 'g'), backRef);
            // strip other targets comments and code
            contents = contents.replace(new RegExp('^[\\s\\t]+' + otherTargetRegStr, 'gm'), '');
            contents = contents.replace(new RegExp(otherTargetRegStr, 'g'), '');
        })
    }

    return contents;
};

/**
 * postcompile
 */
exports.postcompile = function(inputFile, outputFile, charset){
    exports.runTask('template', {src: inputFile, charset: charset});
}

exports.compileSeaJS = function(inputFile, options){
    var seajs = require('../utils/sea');
    var contents = seajs.build(inputFile, {
        'idleading': options.idleading,
        'alias': options.alias,
        'debug': options.debug,
        'paths': options.paths,
        'mainConfigFile' : options.mainConfigFile,
        // output beautifier
        'uglify': {
            beautify: true,
            comments: true
        }
    });

    return contents;
};

/**
 * Strip all definitions generated that hooks on requirejs onBuildWrite
 * Inspried by jQuery build script
 */
exports.advancedStripDefine = function(mainModuleName, varModules, stubModules, name, path, contents){
    // Remove requirejs plugin module like requirejs-tmpl
    if( stubModules && stubModules.indexOf(name) !== -1 ) return '';

    var rdefineEnd = /\}\)[;^}\w\s]*$/;

    // Convert "var" modules to var declarations
    // This is default indicated by including the file in any "var" folder
    // "var module" means the module only contains a return statement that should be converted to a var declaration
    varModules = [].concat( varModules || 'var').join('|');

    if ( new RegExp("\/?("+varModules+")\/").test( name ) ) {
        var namespace = /.*\/([-\w_\$]+)/.exec(name)[1];
        contents = contents
            .replace( /define\([\w\W]*?return/, function(){  // Do not use string replacer with the unsafe namespace like $$
                return "var " + namespace + " ="
            })
            .replace( rdefineEnd, "" );

    } else {

        // Ignore replace return main point's return statement (the only necessary one)
        if ( name !== mainModuleName ) {
            contents = contents
                .replace( /\s*return\s+[^\}]+(\}\);[^\w\}]*)$/, "$1" );
        }

        // Remove define wrappers, closure ends, and empty declarations
        contents = contents
            .replace( /define\([^{]*?{/, "" )
            .replace( rdefineEnd, "" );

        // Remove CommonJS-style require calls
        // Keep an ending semicolon
        contents = contents
            .replace( /(\s+\w+ = )?\s*require\(\s*(")[\w\.\/]+\2\s*\)([,;])/g,
                function( all, isVar, quote, commaSemicolon ) {
                    return isVar && commaSemicolon === ";" ? ";" : "";
                });

        // Remove empty definitions
        contents = contents
            .replace( /define\(\[[^\]]+\]\)[\W\n]+$/, "" );
    }

    return contents;
}

exports.normalStripDefine = function(mainModuleName, varModules, stubModules, name, path, contents){
    // Remove requirejs plugin module like requirejs-tmpl
    if( stubModules && stubModules.indexOf(name) !== -1 ) return '';

    try{
        return require('amdclean').clean(contents);
    }catch(e){
        logger.error(e);
    }
}

exports.compileRequireJS = function (inputFile, outputFile, options, callback) {
    var requirejs = require('requirejs');
    var compiledCode = '';
    var mainFile = options.mainFile;
    var mainConfigFile = options.mainConfigFile || mainFile;

    // See more config at https://github.com/jrburke/r.js/blob/master/build/example.build.js
    var config = {
        name:  (mainFile || inputFile).replace(/\.js$/, ''),
        baseUrl: options.baseUrl,
        packages: [],
        wrap: options.wrap,
        optimize: 'none',
        paths: {},
        include: [],  // Array params: ["foo", "bar"]
        out: function (text) {
            // Do what you want with the optimized text here.
            compiledCode = text;
        },
        stubModules: options.stubModules || []
    };

    if (options.name) {
        config.name = options.name;
    }
    
    if (options.stripDefine){
        config.wrap = {
            start : "(function(window, undefined){",
            end : "})(this);"
        };

        var onBuildWrite = options.stripDefine === 'advanced'? exports.advancedStripDefine: exports.normalStripDefine;
        config.onBuildWrite = onBuildWrite.bind(this, options.mainModuleName, options.varModules, options.stubModules);
        config.skipSemiColonInsertion = true;
        config.stubModules.push('requireLib');
    }

    if (options.includeLoader || options.miniLoader){

        var impl;
        if (options.miniLoader) {
            exports.log('Include mini loader ' +  'almond.js'.grey);
            impl = path.relative(
                path.resolve(options.baseUrl),
                path.resolve(__dirname, '../../node_modules/almond/almond')
            );
        } else {
            exports.log('Include original loader ' +  'require.js'.grey);
            impl = path.relative(
                path.resolve(options.baseUrl),
                path.resolve(__dirname, '../../node_modules/requirejs/require')
            );
        }

        config.name = 'requireLib';
        config.mainConfigFile = mainConfigFile || inputFile;
        config.paths.requireLib = impl;
        config.include.push( path.relative(
            path.resolve(options.baseUrl),
            path.resolve(options.mainFile || inputFile)
        ));
    } else {
        // without loader
        // https://github.com/jrburke/r.js/blob/master/build/tests/lib/amdefine/build.js
         config.name = path.relative(
             path.resolve(options.baseUrl),
             path.resolve(options.mainFile || inputFile)
         ).replace(/\.js$/, '')
    }

    // Specify modules to stub out in the optimized file. The optimizer will
    // use the source version of these modules for dependency tracing and for
    // plugin use, but when writing the text into an optimized layer, these
    // modules will get the following text instead:
    // If the module is used as a plugin:
    //    define({load: function(id){throw new Error("Dynamic load not allowed: " + id);}});
    // If just a plain module:
    //    define({});
    // This is useful particularly for plugins that inline all their resources
    // and use the default module resolution behavior (do *not* implement the
    // normalize() method). In those cases, an AMD loader just needs to know
    // that the module has a definition. These small stubs can be used instead of
    // including the full source for a plugin.
    if(options.stubModules){
        // TODO: if it's a string like 'text,tmpl', format to array
        config.stubModules = options.stubModules;
    }

    if (options.verbose) {
        config.logLevel = 0;  // TRACE: 0, INFO: 1, WARN: 2, ERROR: 3, SILENT: 4
    }

    if (options.minify) {
        // Use UglifyJS to minify the code
        config.optimize = 'uglify';
        config.uglify = {
            toplevel: true,
            ascii_only: options.asciiOnly,
            max_line_length: 1000,

            //How to pass uglifyjs defined symbols for AST symbol replacement,
            //see "defines" options for ast_mangle in the uglifys docs.
            defines: {
                DEBUG: ['name', 'false']
            },

            // Custom value supported by r.js but done differently
            // in uglifyjs directly:
            // Skip the processor.ast_mangle() part of the uglify call (r.js 2.0.5+)
            no_mangle: true
        };
    }

    // By default, comments that have a license in them are preserved in the
    // output. However, for a larger built files there could be a lot of
    // comment files that may be better served by having a smaller comment
    // at the top of the file that points to the list of all the licenses.
    // This option will turn off the auto-preservation, but you will need
    // work out how best to surface the license information.
    if (options.license) {
        config.preserveLicenseComments = true;
    }

    if(options.include) {
        config.include = config.include.concat(options.include)
    }

    if (!_.isEmpty(options.excludeShallow)) {
        config.excludeShallow = options.excludeShallow;
    }

    if (!_.isEmpty(options.exclude)) {
        config.exclude = options.exclude;
    }

    exports.debug("r.js config", config);
    exports.log('Compiling destination file:', outputFile);

    requirejs.optimize(config, function (result) {
        // Back to origin log
        if(outputFile){
            file.write(outputFile, compiledCode);
        }
        // Log requirejs optimizer process ended
        exports.log('RequireJS optimizer finished');
        callback(null, compiledCode);
    });
};
