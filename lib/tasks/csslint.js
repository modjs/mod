var utils = require('../utils'),
    file = require('../utils/file'),
    fs = require('fs'),
    path = require('path'),
    _ = require('underscore');

var csslint = require( "csslint" ).CSSLint;

// TODO
//csslint.getRules().forEach(function(rule){
//    rule.id;
//    rule.desc;
//});

exports.summary = 'Validate css files with csslint';

exports.usage = '<source> [options]';

exports.options = {
    "c" : {
        alias : 'charset'
        ,default : 'utf-8'
        ,describe : 'file encoding type'
    }
};


exports.run = function (opt, callback) {

    //console.log(args.argv);
    var source = opt.source,
        charset = opt.charset,
        rules = opt.rules;

    try {

        task(source, rules, charset);  // TODO

        callback();

    }catch (err){
        callback(err)
    }

};


var task = exports.task = function(inputFile, rules, charset){

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
            exports.warn("[".red + (typeof message.line !== "undefined" ? ( "L" + message.line ).yellow + ":".red + ( "C" + message.col ).yellow : "GENERAL".yellow) + "]".red );
            exports[ message.type === "error" ? "error" : "warn" ]( message.message + " " + message.rule.desc + " (" + message.rule.id + ")" );
        });

        exports.log(result.messages.length + " Warnings")

    } else {
        exports.log("Skipping empty file " + inputFile);
    }


};
