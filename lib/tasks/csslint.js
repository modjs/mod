var utils = require('../utils');
var file = require('../utils/file');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');

var csslint = require( "csslint" ).CSSLint;

// TODO
//csslint.getRules().forEach(function(rule){
//    rule.id;
//    rule.desc;
//});

exports.summary = 'Validate css files with csslint';

exports.usage = '<src> [options]';

exports.options = {
    "charset" : {
        alias : 'c'
        ,default : 'utf-8'
        ,describe : 'file encoding type'
    }
};


exports.run = function (options) {

    var charset = options.charset;
    var rules = options.rules;

    exports.files.forEach(function(inputFile){
        exports.csslint(inputFile, rules, charset);
    });

};


exports.csslint = function(inputFile, rules, charset){

    charset = charset || "utf-8";
    rules = rules || {};
    //console.dir(rules);
    var input = fs.readFileSync(inputFile, charset);

    var ruleset = {};
    csslint.getRules().forEach(function( rule ) {
        ruleset[ rule.id ] = true;
    });


    for ( var rule in rules ) {
        if ( !rules[ rule ] ) {
            delete ruleset[rule];
        } else {
            ruleset[ rule ] = rules[ rule ];
        }
    }

    // console.log(JSON.stringify(ruleset, null, "  "))


    // skip empty files
    if (input.length) {

        exports.log("Linting " + inputFile + "...")

       var  result = csslint.verify( input, ruleset );
        // console.log(JSON.stringify(result,null, "    "));
        result.messages.forEach(function( message, index) {
            var pos = "[".red + (typeof message.line !== "undefined" ? ( "L" + message.line ).yellow + ":".red + ( "C" + message.col ).yellow : "GENERAL".yellow) + "]".red ;
            var msg = message.message + " " + message.rule.desc + " (" + message.rule.id + ")";
            exports[ message.type === "error" ? "error" : "warn" ](pos, '\n', msg);
        });

        exports.log(inputFile.grey, 'has', result.messages.length, "warnings")

    } else {
        exports.log("Skipping empty file " + inputFile);
    }


};
