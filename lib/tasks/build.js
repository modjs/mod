var format = require('../utils/format');
var file = require('../utils/file');
var HTMLParser = require('../utils/htmlparser').HTMLParser;

exports.summary = 'Build the project by convention';

exports.usage = '<source> [options]';

exports.options = {
    "c" : {
        alias : 'charset'
        ,default : 'utf-8'
        ,describe : 'file encoding type'
    }
};


exports.run = function (options, callback) {
    var source = options.source;

    var sourceString = file.read(source);
    var buffer = [];
    HTMLParser(sourceString, {
        start: function(tag, attrs, unary) {
            var startBuffer=[];
            startBuffer.push('<', tag);

            for ( var i = 0, len = attrs.length; i < len; i++ ) {
                var attr = attrs[i];
                var attrName = attr.name;
                var attrValue = attr.escaped;
                var attrFragment = ' '+attrName;
                if(attrValue){
                    attrValue = '"' + attrValue + '"';
                    attrFragment += '=' + attrValue;
                }
                startBuffer.push(attrFragment);
            }

            startBuffer.push('>');
            buffer.push(startBuffer.join(''));
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

    console.log(buffer.join(''))


};
