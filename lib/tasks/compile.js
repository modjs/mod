var tar = require('../utils/tar');
var path = require('path');
var requirejs = require('requirejs');
var seajs = require('../utils/sea');
var _ = require('underscore');
var utils = require('../utils');
var file = require('../utils/file');
var project = require('../project');

var uglifyjs = require('uglify-js');

exports.summary = 'Compile JavaScript/CSS/HTML source';

exports.usage = '<source> [options]';

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
        ,describe : 'Target build level [HTML only]'
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

    "suffix" : {
        describe : 'The output file suffix [JS only]'
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
        ,default: '<source>'
        ,describe: "Specify the file of the configuration for optimization [JS only]"
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
        ,default : true
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

    var cwd = process.cwd();
    var rc = exports.config();

    var source = options.source;
    var dest = options.dest;
    var target = options.target;
    var charset = options.charset;
    var loader =  rc.loader || options.loader;

    // custom compile process
    var compile = options.compile;

    // TODO
    var precompile = options.precompile;
    var postcompile = options.postcompile;

    done = done || function(){};

    var ext = path.extname(source);

    options.source = utils.arrayify(options.source);
    options.exclude = utils.arrayify(options.exclude);
    options.excludeShallow = utils.arrayify(options.excludeShallow);

    // The contents of the compiled file
    var contents;

    // compile html comment directives
    if('.html' === ext ){
        contents = exports.precompile(source, dest, target, charset);
        done(null, contents);
        return contents;
    }
    // combine css import files
    else if('.css' === ext){
        // contents = exports.precompile(source, dest, target, charset);
        // return contents;

        return exports.runTask('combinecss', options, done);
    }
    // compile and combine modules
    else if( '.js' === ext && options.combine){
        // mod compile a.js,b.js
        if(loader == "seajs"){
            return exports.compileSeaJS(cwd, rc, options, done);
        }else if(loader == "requirejs"){
            return exports.compileRequireJS(cwd, rc, options, done);
        }else{
            done('Unsupported modules loader:' + loader);
        }

    }
    // compile modules but do not combine them
    else if('.js' === ext){
        // mod compile *.js -c false

        var jsp = uglifyjs.parser;
        var pro = uglifyjs.uglify;
        var ast;

        exports.files.forEach(function(inputFile){

            var outputFile = path.join(options.dest, path.basename(inputFile));
            var input = file.read(inputFile);
            var opt = {
                except: ['require'],
                ascii_only: options.asciiOnly
            };
            ast = jsp.parse(input);
            ast = pro.ast_mangle(ast, opt); // except require
            ast = pro.ast_squeeze(ast, opt);
            contents = pro.gen_code(ast, opt);

            file.write(outputFile, contents);

            exports.log(inputFile, '>', outputFile);

        });

        done(null, contents);
        return contents;

    }
    // custom compiler
    else if(typeof compile === 'function'){

        exports.files.forEach(function(inputFile){

            var outputFile = inputFile;

            if(file.isDirFormat(dest)){
                outputFile = path.join(dest , path.basename(outputFile) );
            }else{
                outputFile = dest;
            }

            var origin = file.read(inputFile);

            // Custom Compile Example:
            // function (origin) { return Handlebars.precompile(origin)}
            contents = compile(origin);

            file.write(outputFile, contents,  charset);

        });

        done();
        return contents;
    }
    // error branch
    else {
        exports.warn('nothing compiled');
        done();
    }

};


/**
 * precompile based on directive grammar
 * @param inputFile
 * @param outputFile
 * @param target
 * @param charset
 * @returns {*}
 */
exports.precompile = function(inputFile, outputFile, target, charset){

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
        file.write(outputFile, contents, charset);
        exports.log(inputFile, '>', outputFile);
    }

    return contents;

};

/**
 * postcompile
 */
exports.postcompile = function(inputFile, outputFile, charset){
    exports.runTask('template', {source: inputFile, charset: charset});

}


/**
 * postcompile
 * @param cwd
 * @param rc
 * @param options
 * @param callback
 */
exports.compileSeaJS = function(cwd, rc, options, callback){

    options.source.forEach(function(inputFile){

        var dest = options.dest;
        var suffix = options.suffix;
        var outputFile;
        if(file.isDirFormat(dest)){
            outputFile = path.join(dest , path.basename(inputFile) );
            // suffix
            if(options.suffix)
                outputFile = file.suffix(outputFile, suffix);

        }else{
            outputFile = dest;
        }

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

        file.write(outputFile, contents);
        exports.log(inputFile, '>', outputFile);
        exports.runTask('min', {source: outputFile, dest: outputFile});

    });


    callback();

};

/**
 *
 * @param cwd
 * @param rc
 * @param options
 * @param callback
 * @returns {*}
 */
exports.compileRequireJS = function (cwd, rc, options, callback) {

    var packages = [];

    if(!options.mainConfigFile){

        var loaderConfig = 'require.config.js';
        var configFile = path.resolve(options.packageDir || exports.config('directory'), loaderConfig);

        var isConfigFileExist = true;
        try{
            packages = require(configFile).packages;
        }catch(err){
            isConfigFileExist = false;
            exports.log(configFile, "is not exist");
            //return callback(err)
        }

    }

    if (!options.source.length) {

        var originVal = options.source;
        // compile all installed modules by default
        options.source = packages.map(function (pkg) {
            return pkg.name;
        });

        options.source.push(originVal);

        exports.log('include', options.source.join(', '));
    }

    //options.dest = path.join(options.dest, options.source[0] );

    exports.log('Compiling destination file:', options.dest);


    var impl;
    if (options.miniLoader) {
        exports.log('Include mini loader ' +  'almond.js'.grey);
        impl = path.relative(
            path.resolve(options.baseUrl),
            path.resolve(__dirname, '../../node_modules/almond/almond')
        );
    }
    else {
        impl = path.relative(
            path.resolve(options.baseUrl),
            path.resolve(__dirname, '../../node_modules/requirejs/require')
        );
    }


    var outputFile, dest = options.dest;
    if(file.isDirFormat(dest)){
        outputFile = path.join(dest , path.basename( options.source[0] ) );
        if(options.suffix){
            outputFile = file.suffix(outputFile, options.suffix);
        }
    }else{
        outputFile = dest;
    }


    var include;

    // TODO more config: https://github.com/jrburke/r.js/blob/master/build/example.build.js
    var config = {
        baseUrl: options.baseUrl,
        packages: packages,
        // default is source
        mainConfigFile: path.join(options.baseUrl, options.mainConfigFile),
        wrap: options.wrap,
        optimize: 'uglify',
        include: options.source,  // Array params: ["foo", "bar"]
        out: outputFile,
        uglify: {
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
        }

    };


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

    if(options.includeLoader || options.miniLoader){
        config.name = 'requireLib';
        config.paths =  {requireLib: impl};
    }

    if (options.verbose) {
        config.logLevel = 0;  // TRACE: 0, INFO: 1, WARN: 2, ERROR: 3, SILENT: 4
    }

    if (options.minify) {
        config.optimize = 'none';
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

    if (options.excludeShallow && options.excludeShallow.length) {
        config.excludeShallow = options.excludeShallow;
    }

    if (options.exclude && options.exclude.length) {
        config.exclude = options.exclude;
    }

    exports.debug("r.js config", config);

    try {
        requirejs.optimize(config, function (result) {
            // log requirejs optimizer process ended
            exports.log('RequireJS optimizer finished');

            callback(null, result);
        });
    }catch (err) {
        return callback(err);
    }

};
