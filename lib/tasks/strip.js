var utils = require('../utils');
var file = require('../utils/file');
var path = require('path');

exports.summary = 'Source stripping';

exports.usage = '<src> [options]';

exports.options = {
    "dest" : {
        alias : 'd'
        ,describe : 'destination directory or file'
    },

    "charset" : {
        alias : 'c'
        ,default : 'utf-8'
        ,describe : 'file encoding type'
    },

    "bom" : {
        default : true
        ,type : 'boolean'
        ,describe : 'strip bom'
    },

    "tab" : {
        default : true
        ,type : 'boolean'
        ,describe : 'strip tab'
    },

    "code" : {
        default : false
        ,type : 'boolean'
        ,describe : 'default strip alert call if enable'
    },

    "nodes" : {
        describe : 'strip code nodes'
    },

    'output': {
        alias: 'o'
        ,default : 'file'
        ,describe : 'specify output type: file pipe'
    }
};


exports.run = function (options) {

    var dest = options.dest;
    var charset = options.charset;
    var output = options.output;

    var tabRegex = /\t/g, tabReplace ='    '; // 4 space
    var bomRegex = /^\uFEFF/, bomReplace ='';

    var contents;
    exports.files.forEach(function(inputFile){

        if(output === 'file'){
            var outputFile = inputFile;
            if(file.isDirFormat(dest)){
                outputFile = path.join(dest , path.basename(outputFile) );
            }else{
                outputFile = dest;
            }
        }

        contents = file.read(inputFile, charset);

        // about: http://www.ueber.net/who/mjl/projects/bomstrip/
        if(options['bomStrip']) {
            exports.log("bom strip", inputFile, ">", outputFile);
            contents = exports.replace(contents, bomRegex, bomReplace);
        }

        if(options['tabStrip']) {
            exports.log("tab strip", inputFile, ">", outputFile);
            contents = exports.replace(contents, tabRegex, tabReplace);
        }

        if(options.nodes || options['codeStrip']) {
            exports.log("code strip", inputFile, ">", outputFile);
            contents = exports.codeStrip(contents, options);
        }

        if(outputFile){
            file.write(outputFile, contents, charset);
        }

    });

    return contents;
};


exports.replace = function(input, search, replace, flags){

    flags = flags || "gm"; //global  multiline ignoreCase

    if(_.isString(search)){
        search = new RegExp(search,flags);
    }

    //var input = fs.readFileSync(inputFile).toString();
    var output = input.replace(search, replace);

    return output;
};



exports.codeStrip = function(src, options, charset) {

    // if nodes option is be set， that will override the default alert strip
    var nodes = options.nodes || ['alert'];
    var replace = 'undefined';

    var ignoreLines = {};
    scan(src, function(node){

        if(node.comments){
            // console.log(node);
            node.comments.forEach(function(comment){

                if(comment.value.match(/@keep|@ignore/)){
                    ignoreLines[comment.loc.start.line + (comment.loc.end.line-comment.loc.start.line+1)] = true;
                }
            });
        }
    });

    var output = scan(src, function(node){

        if (node.type === 'CallExpression'  && (nodes.indexOf(node.callee.name || (node.callee.object && node.callee.object.name)) > -1 )) {

            if(ignoreLines[node.loc.start.line]){
                exports.log("ignore strip line:" , node.loc.start.line);
            }else{
                exports.log("strip", "L" + node.loc.start.line + ":" + "C" + node.loc.start.column , node.source().red ,'by', replace);
                node.update(replace);
            }
        }
    });

    return output;

};



 function scan(src, opts, fn) {
    if (typeof opts === 'function') {
        fn = opts;
        opts = {};
    }
    if (typeof src === 'object') {
        opts = src;
        src = opts.source;
        delete opts.source;
    }
    src = src || opts.source;
    opts.range = true;
    opts.comment = true;
    opts.loc = true;

    if (typeof src !== 'string') src = String(src);

    // require esprima
    var ast = require('esprima').parse(src, opts);

    var result = {
        chunks : src.split(''),
        toString : function () { return result.chunks.join('') },
        inspect : function () { return result.toString() }
    };
    var index = 0;

    (function walk (node, parent) {
        insertHelpers(node, parent, result.chunks);

        Object.keys(node).forEach(function (key) {
            if (key === 'parent') return;

            var child = node[key];
            if (Array.isArray(child)) {
                child.forEach(function (c) {
                    if (c && typeof c.type === 'string') {
                        walk(c, node);
                    }
                });
            }
            else if (child && typeof child.type === 'string') {
                insertHelpers(child, node, result.chunks);
                walk(child, node);
            }
        });
        fn(node);
    })(ast, undefined);

    return result;
}

function insertHelpers (node, parent, chunks) {
    if (!node.range) return;

    node.parent = parent;

    node.source = function () {
        return chunks.slice(
            node.range[0], node.range[1]
        ).join('');
    };

    if (node.update && typeof node.update === 'object') {
        var prev = node.update;
        Object.keys(prev).forEach(function (key) {
            update[key] = prev[key];
        });
        node.update = update;
    }
    else {
        node.update = update;
    }

    function update (s) {
        chunks[node.range[0]] = s;
        for (var i = node.range[0] + 1; i < node.range[1]; i++) {
            chunks[i] = '';
        }
    }
}
