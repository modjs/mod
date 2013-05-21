var path = require('path');
var format = require('../utils/format');
var file = require('../utils/file');
var seajs = require('../utils/sea');
var HTMLParser = require('../utils/htmlparser').HTMLParser;
var EventEmitter = require('events').EventEmitter;

exports.summary = 'Build the project by convention';

exports.usage = '<source> [options]';

exports.options = {
    "d" : {
        alias : 'dest'
        ,default : 'dist'
        ,describe : 'destination build directory'
    },
    "c" : {
        alias : 'charset'
        ,default : 'utf-8'
        ,describe : 'file encoding type'
    }
};


exports.run = function (options, callback) {

    var emitter = new EventEmitter();
    var source = options.source;
    var dest = options.dest;

    if(!file.isDirFormat(dest)){
        return exports.error('build destination must be a directory');
    }

    var helpers = exports.loadTask('template').helpers;
    var sourceString = file.read(source);
    var buffer = [];

    // html parsing
    HTMLParser(sourceString, {
        start: function(tag, attrs, unary) {

            var src, loader, destPath;

            if(loader = isScriptLoader(tag, attrs)){

                var mainSrc = loader.main;

                if( loader.name === 'requirejs' ) {

                    destPath = path.join(dest, mainSrc);

                    var options = {
                        source: path.basename(mainSrc),
                        dest: destPath,
                        loader: loader.name,
                        baseUrl: path.dirname(mainSrc),
                        miniLoader: true
                    };


                }else{

                    // TODO: seajs compile


                }

                // defined options even the value is undefined will be consider a user input params, that will replace the default value
                if(loader.config){
                    options.mainConfigFile = loader.config
                }

                // TODO: sync compile task
                exports.runTask('compile', options, function(err){
                    // minify
                    file.write(destPath, helpers.content(destPath));
                    // rev
                    src = path.join(path.dirname(mainSrc), helpers.rev(destPath));
                    // normalize the url
                    src = src.split(path.sep).join('/');
                    // emit run
                    emitter.emit('run');
                });

                buffer.push({toString: function(){
                    return '<script src="'+src+'">';
                }});

            }else {

                if( (src = isLocalStylesheet(tag, attrs)) || (src = isLocalScript(tag, attrs)) ){

                    // join the dest dir path
                    destPath = path.join(dest, src);
                    // minify by content helper
                    file.write(destPath, helpers.content(src));
                    exports.log(src, '>', destPath);
                    // rev dest file
                    src = path.join(path.dirname(src), helpers.rev(destPath));
                }


                var startBuffer= [];
                startBuffer.push('<', tag);

                for ( var i = 0, len = attrs.length; i < len; i++ ) {
                    var attr = attrs[i];
                    var attrName = attr.name;
                    var attrValue = attr.escaped;
                    var attrFragment = ' '+attrName;
                    // replace src path
                    if(src && (attrName.toLowerCase() === 'src' || attrName.toLowerCase() === 'href')){
                        // fuck the windows file separator
                        attrValue = src.split(path.sep).join('/');
                    }

                    if(attrValue) {
                        attrValue = '"' + attrValue + '"';
                        attrFragment += '=' + attrValue;
                    }

                    startBuffer.push(attrFragment);

                }

                startBuffer.push('>');
                buffer.push(startBuffer.join(''));

            }

        },

        end: function(tag) {
            buffer.push('</', tag, '>');
        },
        chars: function(text) {
            buffer.push(text);
        },
        comment: function(text) {
            text = '<!--' + text + '-->';
            buffer.push(text);
        },
        doctype: function(doctype) {
            buffer.push(doctype);
        }
    });


    emitter.on('run',function(){

        var destHTMLContent = buffer.join('');
        var destHTMLPath = path.join(dest, source);
        file.write(destHTMLPath, destHTMLContent);
        exports.log(source, '>', destHTMLPath);

    });


};


function isLocalStylesheet(tag, attrs){

    if(tag == 'link'){
        var isStylesheet, isLocalLink, href;
        for ( var i = 0, len = attrs.length; i < len; i++ ) {
            var attr = attrs[i];
            var attrName = attr.name.toLowerCase();
            var attrValue = attr.escaped.toLowerCase();

            if(attrName === 'rel' && attrValue == 'stylesheet'){
                isStylesheet = true;
            }else if(attrName === 'href' && attrValue &&!attrValue.match(/:\/\//)){  // attr value can not be empty
                isLocalLink = true;
                href = attrValue;
            }
        }

        return isStylesheet && isLocalLink && href;
    }

}

function isLocalScript(tag, attrs){
    if(tag == 'script'){
        var isLocalLink, src;
        for ( var i = 0, len = attrs.length; i < len; i++ ) {
            var attr = attrs[i];
            var attrName = attr.name.toLowerCase();
            var attrValue = attr.escaped.toLowerCase();
            // attr value can not be empty
            if(attrName === 'src' && attrValue && !attrValue.match(/:\/\//)){
                isLocalLink = true;
                src = attrValue;
            }
        }
        return isLocalLink && src;
    }
}

function isScriptLoader(tag, attrs){
    if(tag == 'script'){
        var hasMainConfig, loaderName, configSrc, mainSrc, isLoaderLocked;
        for ( var i = 0, len = attrs.length; i < len; i++ ) {
            var attr = attrs[i];
            var attrName = attr.name.toLowerCase();
            var attrValue = attr.escaped.toLowerCase();

            // attr value can not be empty
            if(attrValue && !attrValue.match(/:\/\//)){

                // requirejs and seajs use the some attr name
                if(attrName === 'data-main'){
                    hasMainConfig = true;
                    mainSrc = attrValue;
                }

                // specify the loader by user
                else if(attrName === 'data-loader'){
                    loaderName = attrValue;
                    isLoaderLocked = true;
                }

                // seajs only
                else if(attrName === 'data-config'){
                    configSrc = attrValue;
                }


            }

            // loader could be a cdn path
            if(attrName === 'src' && !isLoaderLocked){
                if( attrValue.match(/sea\.js|sea-debug\.js/) ) loaderName = 'seajs';
                else if(attrValue.match(/requirejs|require\.js/) ) loaderName = 'requirejs';
            }

        }

        if(hasMainConfig && loaderName){

            if(path.extname(mainSrc) === ''){
                mainSrc += '.js';
            }

            return {
                name: loaderName,
                main: mainSrc,
                config: configSrc // seajs only
            };

        }

    }
}

