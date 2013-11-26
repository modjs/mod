var path = require('path');
var _ = require('underscore');
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

    "target" : {
        default : 'dist'
        ,describe : 'Target build level'
    },

    "suffix" : {
        describe : 'The output file suffix'
    },

    'output': {
        alias: 'o'
        ,default : 'file'
        ,describe : 'specify output type: file or pipe'
    },

    "loader" : {
        default: 'requirejs'
        ,describe : 'Use the Modules Loader [JS only]'
    },

    "base-url" : {
        alias : 'baseUrl'
        ,default: '.'
        ,describe : 'All modules are located relative to this path [JS only]'
    },

    "exclude" : {
        describe : 'Deep excludes a module and it\'s dependencies from the build [JS only]'
    },

    "exclude-shallow" : {
        alias : 'excludeShallow'
        ,describe : 'Shallow excludes a module from the build (it\'s dependencies will still be included) [JS only]'
    },

    "package-dir" : {
        alias : 'packageDir'
        ,describe : 'Modules directory to use [JS only]'
    },

    "ascii-only" : {
        default: true
        ,type : 'boolean'
        ,alias : 'asciiOnly'
        ,describe: "Ascii encoding only [JS only]"
    },

    'combine' : {
        describe : 'Combine require modules if existed [JS only]'
        ,default : true
        ,type : 'boolean'
    },

    "main-config-file" : {
        alias : "mainConfigFile"
        ,default: '<src>'
        ,describe: "Specify the file of the configuration for optimization [JS only]"
    },

    "strip-define" : {
        alias: 'stripDefine'
        ,default: false
        ,describe: "Strip all definitions in generated source [requirejs only]"
    },

    "mini-loader" : {
        alias : 'miniLoader'
        ,describe : 'Use the lighweight almond shim instead of RequireJS, smaller filesize but can only load bundled resources and cannot request additional modules [requirejs only]'
    },

    'include-loader':{
        describe : 'If include module loader [requirejs only]'
        ,alias : 'includeLoader'
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

    "stub-modules": {
        alias: "stubModules"
        ,describe: "Specify modules to stub out in the optimized file [requirejs only]"
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
    var target = options.target;
    var output = options.output;
    var suffix = options.suffix;
    var charset = options.charset;
    var loader =  options.loader;

    options.src = options.src || options.source;
    options.mainConfigFile = options.mainConfigFile || options.src;

    // custom compile process
    var compile = options.compile;

    // TODO
    var precompile = options.precompile;
    var postcompile = options.postcompile;

    done = done || function(){};

    // for async exec
    if('.js' === path.extname(options.src) && options.combine && loader == "requirejs"){
        var inputFile = options.src;
        var outputFile;
        if(output === 'file'){
            outputFile = file.outputFile(inputFile, dest, suffix, ".compiled");
        }

        // TODO: should process that in optimist
        options.exclude = utils.arrayify(options.exclude);
        options.excludeShallow = utils.arrayify(options.excludeShallow);

        return exports.compileRequireJS(options.src, outputFile, options, done);
    }

    // The contents of the compiled file
    var contents;
    exports.files.forEach(function(inputFile){

        var ext = path.extname(inputFile);
        var outputFile;

        if(output === 'file'){
            outputFile = file.outputFile(inputFile, dest, suffix, ".compiled");
        }

        // compile html/css comment directives
        if('.html' === ext || '.css' === ext){
            contents = exports.precompile(inputFile, target, charset);
        }
        // compile and combine modules
        else if( '.js' === ext && options.combine){
            // mod compile a.js,b.js
            if(loader == "seajs"){
                contents =  exports.compileSeaJS(inputFile, options);
            }else if(loader == "requirejs"){
                exports.compileRequireJS(inputFile, outputFile, options, done);
                // reset value
                outputFile = '';
            }else{
                exports.error('Unsupported modules loader: ' + loader);
            }

        }
        // compile modules but do not combine them
        else if('.js' === ext){
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
        // custom compiler
        else if( typeof compile === 'function' ){

            var origin = file.read(inputFile);
            // Custom Compile Example:
            // function (origin) { return Handlebars.precompile(origin)}
            contents = compile(origin);

        }
        // error branch
        else {
            exports.warn('nothing compiled');
        }


        if(outputFile){
            file.write(outputFile, contents, charset);
            exports.log(inputFile, '>', outputFile);
        }

    });

    done(null, contents);
    return contents;
};

/**
 * precompile based on directive grammar
 * @param inputFile
 * @param target
 * @param charset
 * @returns {*}
 */
exports.precompile = function(inputFile, target, charset){

    var delimiterHead, delimiterHead2, delimiterEnd, delimiterSign, backRef;
    if( path.extname(inputFile) === '.css' ){
        // CSS precompile directive grammar
        delimiterHead = "/\\*";
        delimiterHead2 = delimiterHead;
        delimiterEnd = "\\*/";
        delimiterSign = "/";
        backRef = "$1";
    } else if ( path.extname(inputFile) === '.html' ){
        // HTML precompile directive grammar
        delimiterHead = "<!--";
        delimiterHead2 = "<!--(<!)?";
        delimiterEnd = "-->";
        delimiterSign = ">(<!-->)?";
        backRef = "$2";
    }

    var contents = file.read(inputFile, charset);

    if(contents) {
        var targetRegStr = delimiterHead + '\\s*\\(?\\s*if\\s+target\\s+' + target + '\\s*\\)?\\s*'+ delimiterSign +'([\\s\\S]*?)'+ delimiterHead2 +'\\s*\\(?\\s*endif\\s*\\)?\\s*'+ delimiterEnd;
        var otherTargetRegStr = delimiterHead + '\\s*\\(?\\s*if\\s+target\\s+.*?\\)?\\s*'+ delimiterSign +'([\\s\\S]*?)'+ delimiterHead2 +'\\s*\\(?\\s*endif\\s*\\)?\\s*'+ delimiterEnd + '[\r\n]*';
        // strip comments and keep target code
        contents = contents.replace(new RegExp(targetRegStr, 'g'), backRef);
        // strip other targets comments and code
        contents = contents.replace(new RegExp('^[\\s\\t]+' + otherTargetRegStr, 'gm'), '');
        contents = contents.replace(new RegExp(otherTargetRegStr, 'g'), '');
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
    if(stubModules && stubModules.indexOf(name) !== -1) return '';

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
    if(stubModules && stubModules.indexOf(name) !== -1) return '';

    try{
        return require('amdclean').clean(contents);
    }catch(e){
        logger.error(e);
    }
}

exports.compileRequireJS = function (inputFile, outputFile, options, callback) {
    var requirejs = require('requirejs');
    var compiledCode = '';
    // See more config at https://github.com/jrburke/r.js/blob/master/build/example.build.js
    var config = {
        name: inputFile.replace(/\.js$/, ''),
        baseUrl: options.baseUrl,
        packages: [],
        // default is source
        mainConfigFile: path.join(options.baseUrl, options.mainConfigFile),
        wrap: options.wrap,
        optimize: 'none',
        paths: {},
        include: [],  // Array params: ["foo", "bar"]
        out: function (text) {
            //Do what you want with the optimized text here.
            compiledCode = text;
        }
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

    } else if (options.includeLoader || options.miniLoader){
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
        config.paths.requireLib = impl;
        config.include.push(inputFile);
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

    if (options.excludeShallow && options.excludeShallow.length) {
        config.excludeShallow = options.excludeShallow;
    }

    if (options.exclude && options.exclude.length) {
        config.exclude = options.exclude;
    }

    exports.debug("r.js config", config);

    exports.log('Compiling destination file:', outputFile);

    try {
        // Origin logging is ugly, do whitespace prefix
        var originLog = console.log;
        console.log = function(){
            var args = _.toArray(arguments);
            args = args.map(function(arg){
                return arg.replace(/\n/g, "  \n  ")
            })
            originLog.apply(this, args);
        };
        requirejs.optimize(config, function (result) {
            // Back to origin log
            console.log = originLog;
            if(outputFile){
                file.write(outputFile, compiledCode);
            }
            // Log requirejs optimizer process ended
            exports.log('RequireJS optimizer finished');

            callback(null, compiledCode);
        });
    }catch (err) {
        return callback(err);
    }
};
