var tar = require('../utils/tar'),
    path = require('path'),
    requirejs = require('requirejs'),
    seajsBuild = require('seajs-build'),
    _ = require('underscore'),
    utils = require('../utils'),
    file = require('../utils/file'),
    project = require('../project');

var uglifyjs = require('uglify-js');

exports.summary = 'Compile JavaScript/CSS/HTML source';

exports.usage = '<source> [options]';

exports.options = {

    "d" : {
        alias : 'dest'
        ,default : './dist'
        ,describe : 'Output file for the compiled code'
    },

    "s" : {
        alias : 'suffix'
        ,default : '.all'
        ,describe : 'destination file suffix append'
    },

    "c" : {
        alias : 'charset'
        ,default : 'utf-8'
        ,describe : 'file encoding type'
    },

    "target" : {
        default : 'dist'
        ,describe : 'target build level [HTML only]'
    },

    "exclude" : {
        describe : 'Deep excludes a module and it\'s dependencies from the build'
    },

    "exclude-shallow" : {
        alias : 'excludeShallow'
        ,describe : 'Shallow excludes a module from the build (it\'s dependencies will still be included)'
    },

    "w" : {
        alias : 'wrap'
        ,describe : 'Wraps the output in an anonymous function to avoid require and define functions being added to the global scope, this often makes sense when using the almond option.'
    },

    "mini-loader" : {
        alias : 'miniLoader'
        ,describe : 'Use the lighweight almond shim instead of RequireJS, smaller filesize but can only load bundled resources and cannot request additional modules [requirejs only]'
    },
    "v" : {
        alias : 'verbose'
        ,default: true
        ,describe : 'Increase log level to report all compiled modules'
    },
    "l" : {
        describe : 'If include license comments'
        ,alias : 'license'
        ,default : false
        ,type : 'boolean'
    },
    "m" : {
        describe : 'If minify concatenated file with UglifyJS'
        ,alias : 'minify'
        ,default : true
        ,type : 'boolean'
    },

    'combine' : {
        describe : 'Combine require modules if existed'
        ,default : true
        ,type : 'boolean'
    },

    'combine-all':{
        describe : 'Combine all modules, throw error if cannot find require module'
        ,alias : 'combineAll'
        ,default : false
        ,type : 'boolean'
    },

    'include-loader':{
        describe : 'If include module loader'
        ,alias : 'includeLoader'
        ,default : false
        ,type : 'boolean'
    },

    "root-path" : {
        describe: "Modules root path [seajs only]"
        ,alias : 'rootPath'
    },
    "root-url" : {
        describe: "Modules root url [seajs only]"
        ,alias : 'rootUrl'
    },
    "ascii-only" : {
        default: true
        ,type : 'boolean'
        ,alias : 'asciiOnly'
        ,describe: "ascii only"
    },
    "package-dir" : {
        alias : 'packageDir'
        ,describe : 'Modules directory to use'
    },
    "base-url" : {
        alias : 'baseUrl'
        ,describe : 'all modules are located relative to this path'
    },

    "main-config-file" : {
        alias : "mainConfigFile"
        ,default: '<source>'
        ,describe: "Specify the file of the configuration for optimization [requirejs only]"
    },

    "stub-modules": {
        alias: "stubModules"
        ,describe: "Specify modules to stub out in the optimized file [requirejs only]"
    }


};


exports.run = function (options, callback) {

    var cwd = process.cwd();
    var rc = exports.getRuntimeConfig();

    var source = options.source,
        dest = options.dest,
        target = options.target,
        charset = options.charset;

    // custom compile process
    var compile = options.compile;
    // TODO
    var beforeCompile = options.beforeCompile;
    var afterCompile = options.afterCompile;

    var ext = path.extname(source);

    options.source = utils.arrayify(options.source);
    options.exclude = utils.arrayify(options.exclude);
    options.excludeShallow = utils.arrayify(options.excludeShallow);

    // TODO
    if('.html' === ext ){
        exports.compileHTML(source, dest, target, charset);
        callback();
    }
    else if('.css' === ext){
        exports.runTask('combincss', options, callback);
    }
    // mod compile a.js,b.js
    else if( '.js' === ext && options.combine){

        if(rc.loader == "seajs"){
            exports.compileSeaJS(cwd, rc, options, callback);
        }else if(rc.loader == "requirejs"){
            exports.compileRequireJS(cwd, rc, options, callback);
        }else{
            return exports.error('No loader specified in Modfile');
        }

    }else if('.js' === ext){
        // mod compile *.js -c false

        var jsp = uglifyjs.parser;
        var pro = uglifyjs.uglify;
        var ast;

        var files = file.glob(options.source);
        files.forEach(function(inputFile){

            var outputFile = path.join(options.dest, path.basename(inputFile));
            var input = file.read(inputFile);
            var opt = {
                except: ['require'],
                ascii_only: options.asciiOnly
            };
            ast = jsp.parse(input);
            ast = pro.ast_mangle(ast, opt); // except require
            ast = pro.ast_squeeze(ast, opt);
            var output = pro.gen_code(ast, opt);

            file.write(outputFile, output);

            exports.log(inputFile, '>', outputFile);

        });

        callback();

    } else if(typeof compile === 'function'){

        file.globSync(source).forEach(function(inputFile){

            var outputFile = inputFile;

            if(file.isDirFormat(dest)){
                outputFile = path.join(dest , path.basename(outputFile) );
            }else{
                outputFile = dest;
            }

            var origin = file.read(inputFile);

            // Custom Compile Example:
            // function (origin) { return Handlebars.precompile(origin)}
            var compiled = compile(origin);

            file.write(compiled, outputFile, charset);

        });

        callback();
    } else {
        exports.warn('nothing compiled');
        callback();
    }

};


/*
 <!--(if target dummy)><!--><script data-main="app/main" src="libs/require.js"></script><!--<!(endif)-->
 <!--(if target release)><script data-main="app/main" src="require.js"></script><!(endif)-->
 <!--(if target debug)><script data-main="app/main" src="require.js"></script><!(endif)-->
 */
exports.compileHTML = function(inputFile, outputFile, target, charset){

    var contents = file.read(inputFile, charset);

    if(contents) {
        contents = contents.replace(new RegExp('<!--[\\[\\(]if target ' + target + '[\\]\\)]>(<!-->)?([\\s\\S]*?)(<!--)?<![\\[\\(]endif[\\]\\)]-->', 'g'), '$2');
        contents = contents.replace(new RegExp('^[\\s\\t]+<!--[\\[\\(]if target .*?[\\]\\)]>(<!-->)?([\\s\\S]*?)(<!--)?<![\\[\\(]endif[\\]\\)]-->[\r\n]*', 'gm'), '');
        contents = contents.replace(new RegExp('<!--[\\[\\(]if target .*?[\\]\\)]>(<!-->)?([\\s\\S]*?)(<!--)?<![\\[\\(]endif[\\]\\)]-->[\r\n]*', 'g'), '');
        file.write(outputFile, contents, charset);
    }

};

exports.compileSeaJS = function(cwd, rc, options, callback){

    var loaderConfig = "seajs.config.js";

    var configFile = path.resolve(options.packageDir, loaderConfig);
    var isConfigFileExist = true;
    var alias = {};
    try{
        alias = require(configFile).alias;

    }catch(err){
        isConfigFileExist = false;
        exports.log(configFile, "is not exist");
    }

    // console.log(options);

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

        seajsBuild(inputFile, outputFile, {
            'combine_all': options.combineAll,
            'base_path': options.baseUrl,
            'app_path': options.rootPath,
            'app_url': options.rootUrl,
            'alias': alias,
            'excludes': options.exclude
            ,'compiler_options': {
                ascii_only : options.asciiOnly
                //  , except: ['require']
                , defines: {
                    DEBUG: ['name', 'false'],
                    VERSION: ['string', '1.0']
                }
                // , beautify : true
            }
        });
    });


    callback();

};

exports.compileRequireJS = function (cwd, rc, options, callback) {

    var packages = [];

    if(!options.mainConfigFile){

        var loaderConfig = 'require.config.js';
        var configFile = path.resolve(options.packageDir, loaderConfig);

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

    var include;

    // TODO more config: https://github.com/jrburke/r.js/blob/master/build/example.build.js
    var config = {
        baseUrl: options.baseUrl,
        packages: packages,
        // default is source
        mainConfigFile: path.join(options.baseUrl, options.mainConfigFile),
        wrap: options.wrap,
        optimize: 'uglify',
        include: options.source,
        out: options.dest,
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
    //console.log(config)
    exports.debug("r.js config", config);

    try {
        requirejs.optimize(config, function (result) {
            // log requirejs optimizer process ended
            exports.log('RequireJS optimizer finished');

            callback(null, result);
        });
    }
    catch (err) {
        return callback(err);
    }

};
