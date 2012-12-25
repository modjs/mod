var tar = require('../utils/tar'),
    path = require('path'),
    requirejs = require('requirejs'),
    seajsBuild = require('seajs-build'),
    _ = require('underscore'),
    utils = require('../utils'),
    file = require('../utils/file'),
    project = require('../project');

var uglifyjs = require('uglify-js');

exports.summary = 'Compile CSS/HTML/JavaScript source';

exports.usage = '<source> [options]';

exports.options = {

    "d" : {
        alias : 'dest'
        ,default : './dist'
        ,describe : 'Output file for the compiled code'
    },
    "t" : {
        alias : 'target'
        ,demand : true
        ,describe : 'target build level'
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
    }

};


exports.run = function (options, callback) {

    var cwd = process.cwd();
    var rc = exports.getRuntimeConfig();

    var source = options.source,
        dest = options.dest,
        target = options.target,
        charset = options.charset;

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
    else if(options.combine){

        if(rc.loader == "seajs"){
            exports.compileSeaJS(cwd, rc, options, callback);
        }else if(rc.loader == "requirejs"){
            exports.compileRequireJS(cwd, rc, options, callback);
        }

    }else{
        // mod compile *.js -c false

        var jsp = uglifyjs.parser;
        var pro = uglifyjs.uglify;
        var ast;

        var files = file.glob(options.source);

        files.forEach(function(inputFile){

            var outputFile = path.join(options.dest, inputFile);
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
    }

};


/*
 <!--(if target release)><script data-main="app/main" src="require.js"></script><!(endif)-->
 <!--(if target debug)><script data-main="app/main" src="require.js"></script><!(endif)-->
 <!--(if target dummy)><!--><script data-main="app/main" src="libs/require.js"></script><!--<!(endif)-->
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

    console.log(options);

    options.source.forEach(function(inputFile){
        // TODO: a.js + b.js  => ab.js
        var outputFile = path.join(options.dest, inputFile);

        seajsBuild(inputFile, outputFile, {
            'combine_all': options.combineAll,
            'base_path': options.baseUrl,
            'app_path': options.rootPath,
            'app_url': options.rootUrl,
            'alias': options.alias,
            'excludes': options.exclude
            ,'compiler_options': {
                ascii_only : options.asciiOnly
//            , except: ['require']
            , defines: {
                DEBUG: ['name', 'false'],
                VERSION: ['string', '1.0']
            }
//            , beautify : true
            }
        });
    });


    callback();

};

exports.compileRequireJS = function (cwd, rc, options, callback) {

    var loaderConfig = 'require.config.js';
    var configFile = path.resolve(options.packageDir, loaderConfig);
    var isConfigFileExist = true;
    var packages = [];

    try{
        packages = require(configFile).packages;
    }catch(err){
        isConfigFileExist = false;
        exports.log(configFile, "is not exist");
        //return callback(err)
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

    options.dest = path.join(options.dest, options.source[0] );

    exports.log('compiling', options.dest);


    var impl;
    if (options.miniLoader) {
        exports.log('using almond.js');
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

    if(isConfigFileExist){
        include = [
            path.relative(options.baseUrl, configFile)
        ].concat(options.include);
    }else{
        include = options.source;
    }

    // TODO more config: https://github.com/jrburke/r.js/blob/master/build/example.build.js
    var config = {
        baseUrl: options.baseUrl,
        packages: packages,
        wrap: options.wrap,
        optimize: 'uglify',
        include: include,
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

            //Custom value supported by r.js but done differently
            //in uglifyjs directly:
            //Skip the processor.ast_mangle() part of the uglify call (r.js 2.0.5+)
            no_mangle: true
        }
    };

    if(options.includeLoader){
        config.name = 'requireLib';
        config.paths =  {requireLib: impl};
    }

    if (options.verbose) {
        config.logLevel = 0;
    }

    if (options.minify) {
        config.optimize = 'none';
    }

    //By default, comments that have a license in them are preserved in the
    //output. However, for a larger built files there could be a lot of
    //comment files that may be better served by having a smaller comment
    //at the top of the file that points to the list of all the licenses.
    //This option will turn off the auto-preservation, but you will need
    //work out how best to surface the license information.
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
        requirejs.optimize(config, function (build_response) {
            callback(null, build_response);
        });
    }
    catch (err) {
        return callback(err);
    }

};
