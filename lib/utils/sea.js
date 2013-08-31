// Inspired by grunt-cmd-transport(https://github.com/spmjs/grunt-cmd-transport)
var esprima = require('esprima');
var path = require('path');
var ast = require('cmd-util').ast;
var iduri = require('cmd-util').iduri;
var file = require('./file');
var _ = require('underscore');
var logger = require('./logger');

exports.build = build;

function build(inputFile, options){
    // reset build data
    build.mainId = null;
    transport.records = [];

    var pluginContents, configContents, mainFileContents, useContents;

    if(options.mainConfigFile){

        var config = exports.findSeajsConfig( file.read( options.mainConfigFile ) );

        var configData = config.data;

        var originConfigData = JSON.parse(JSON.stringify(configData));

            // remove exports alias config
        _.forEach(configData.alias, function(val, key){
            if(_.isObject(val)){
                delete configData.alias[key];
            }
        });

        var plugins = [];
        // TODO: support custom plugins
        configData.plugins.forEach(function(pluginName){
            var pluginPath;
            if(options.plugins){
                pluginPath = options.plugins[pluginName];
            }
            pluginPath = pluginPath || path.resolve(__dirname, '../../asset/seajs/plugin-'+ pluginName + '.js');
            if(file.exists(pluginPath)){
                plugins.push('// plugin-' + pluginName);
                plugins.push(file.read(pluginPath));
            }else{
                logger.warn(pluginName + ' plugin not found...');
            }
        });

        pluginContents = plugins.join('\n');

        // Alias of modules.
        options.alias = configData.alias;

        configContents = ['seajs.config(', config.sourceWithoutPlugins, ');'].join('');
    }

    mainFileContents = transport(inputFile, options);

    useContents = ['seajs.use("', build.mainId ,'");'].join('');

    var contents = [pluginContents, configContents, mainFileContents, useContents].join('\n');

    return contents;

};

function transport(inputFile, options){

    var inputFileName = inputFile;
    if(inputFileName.charAt(0) === '.'){
        inputFileName = iduri.absolute('', inputFileName);
    }

    var contents = file.read(inputFile);
    var astCache = ast.getAst(contents);
    var meta = ast.parseFirst(astCache);

    if (!meta) {
        return logger.warn('Found non cmd module "' + inputFile + '"');
    }

    if (meta.id) {
        logger.warn('Found id in "' + inputFile + '"');
        return contents;
    }

    var deps = parseDependencies(inputFile, options);

    if (deps.length) {
        logger.debug('Found dependencies ' + deps);
    } else {
        logger.debug('Found no dependencies');
    }

    var id = (options.idleading + inputFileName.replace(/\.js$/, '')).replace(/\\/g, '/');
    //  set main module id
    if(!build.mainId) build.mainId = id;

    astCache = ast.modify(astCache, {
        // TODO
        id: id,
        dependencies: deps,
        require: function(v) {
            if (v.charAt(0) === '.') {
                return iduri.absolute(id, v);
            }
            return iduri.parseAlias(options, v);
        }
    });


    contents = astCache.print_to_string(options.uglify);

    // concat deps
    meta = ast.parseFirst(contents);
    var depContents = meta.dependencies.map(function(dep) {
        if (dep.charAt(0) === '.') {
            var id = iduri.absolute(meta.id, dep);
            if (_.contains(transport.records, id)) {
                return;
            }
            transport.records.push(id);

            var fpath = path.join(path.dirname(inputFile), dep);
            if (!/\.js$/.test(fpath)) fpath += '.js';
            if (!file.exists(fpath)) {
                logger.warn('File ' + fpath + ' not found');
                return '';
            }

            return transport(fpath, options);

        }
    }).filter(function(v){return v}).join('\n');

    return [depContents, contents].join('\n');
}

function parseDependencies(fpath, options) {
    var rootpath = fpath;

    function relativeDependencies(fpath, options, basefile) {
        if (basefile) {
            fpath = path.join(path.dirname(basefile), fpath);
        }
        fpath = iduri.appendext(fpath);

        var deps = [];
        var moduleDeps = {};

        if (!file.exists(fpath)) {
            logger.warn("Can't find " + fpath);
            return [];
        }
        var data = file.read(fpath);
        var parsed = ast.parseFirst(data);
        parsed.dependencies.forEach(function(id) {

            if (id.charAt(0) === '.') {
                // fix nested relative dependencies
                if (basefile) {
                    var altId = path.join(path.dirname(fpath), id);
                    altId = path.relative(path.dirname(rootpath), altId);
                    altId = altId.replace(/\\/g, '/');
                    if (altId.charAt(0) !== '.') {
                        altId = './' + altId;
                    }
                    deps.push(altId);
                } else {
                    deps.push(id);
                }
                if (/\.js$/.test(iduri.appendext(id))) {
                    deps = _.union(deps, relativeDependencies(id, options, fpath));
                }
            } else if (!moduleDeps[id]) {
                var alias = iduri.parseAlias(options, id);
                deps.push(alias);

                // don't parse no javascript dependencies
                var ext = path.extname(alias);
                if (ext && ext !== '.js') return;

                var mdeps = moduleDependencies(id, fpath, options);
                moduleDeps[id] = mdeps;
                deps = _.union(deps, mdeps);
            }
        });
        return deps;
    }

    return relativeDependencies(fpath, options);
}

function moduleDependencies(id, parentPath, options) {
    var alias = iduri.parseAlias(options, id);

    if (iduri.isAlias(options, id) && alias === id) {
        // usually this is "$"
        return [];
    }

    var fpath = iduri.appendext(alias);

    if (!/\.js$/.test(fpath)) return [];

    options.paths.some(function(base) {
        var filepath = path.join(base, fpath);
        if (file.exists(filepath)) {
            logger.debug('Find module "' + filepath + '"');
            fpath = filepath;
            return true;
        }
    });

    if (!fpath) {
        logger.warn("Can't find module " + alias + " in " + parentPath);
        return [];
    }

    if (!file.exists(fpath)) {
        logger.warn("Can't find " + fpath + " in " + parentPath);
        return [];
    }

    var data = file.read(fpath);
    var parsed = ast.parse(data);
    var deps = [];

    var ids = parsed.map(function(meta) {
        return meta.id;
    });

    parsed.forEach(function(meta) {
        meta.dependencies.forEach(function(dep) {
            dep = iduri.absolute(alias, dep);
            if (!_.contains(deps, dep) && !_.contains(ids, dep) && !_.contains(ids, dep.replace(/\.js$/, ''))) {
                deps.push(dep);
            }
        });
    });
    return deps;
}

/**
 * Finds any config that is passed to seajs.
 * @param {String} fileContents
 *
 * @returns {Object} a config details object with the following properties:
 * - config: {Object} the config object found. Can be undefined if no
 * config found.
 * - range: {Array} the start index and end index in the contents where
 * the config was found. Can be undefined if no config found.
 * Can throw an error if the config in the file cannot be evaluated in
 * a build context to valid JavaScript.
 */
exports.findSeajsConfig = function findSeajsConfig(fileContents) {
    var configSource, configData, configSourceWithoutPlugins,
        astRoot = esprima.parse(fileContents, {
            range: true
        });

    traverse(astRoot, function (node) {

        if ( hasSeajsConfig(node) ) {

            var arg = node['arguments'] && node['arguments'][0];

            if (!configSource && arg && arg.type === 'ObjectExpression') {
                configSource = nodeToString(fileContents, arg);
            }
        }

        if(node && node.type === 'Property' && node.key && node.key.name === 'plugins'){

            var configPluginsSource = nodeToString(fileContents, node);
            configSourceWithoutPlugins  = configSource.replace(configPluginsSource, 'plugins:[]');
            return false;
        }

    });

    if (configSource) {
        configData = eval('(' + configSource + ')');
    }

    return {
        data: configData,
        source: configSource,
        sourceWithoutPlugins: configSourceWithoutPlugins
    };
};

// From an esprima example for traversing its ast.
function traverse(object, visitor) {
    var key, child;

    if (!object) {
        return;
    }

    if (visitor.call(null, object) === false) {
        return false;
    }
    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null) {
                if (traverse(child, visitor) === false) {
                    return false;
                }
            }
        }
    }
}

// seajs.config({})
function hasSeajsConfig(node) {
    var callName,
        c = node && node.callee;

    if (node &&
        node.type === 'CallExpression' &&
        c &&
        c.type === 'MemberExpression' &&
        c.object &&
        c.object.type === 'Identifier' &&
        c.object.name === 'seajs' &&
        c.property &&
        c.property.name === 'config') {
            // seajs.config({}) call
            callName = c.object.name + 'Config';
    }

    return callName;
}

/**
 * Converts an AST node into a JS source string by extracting
 * the node's location from the given contents string. Assumes
 * esprima.parse() with ranges was done.
 * @param {String} contents
 * @param {Object} node
 * @returns {String} a JS source string.
 */
function nodeToString(contents, node) {
    var range = node.range;
    return contents.substring(range[0], range[1]);
}
