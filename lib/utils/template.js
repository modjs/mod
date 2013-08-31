var _ = require('underscore');
var file = require('./file');

// When customizing `template.settings`, if you don't want to define an
// interpolation, evaluation or escaping regex, we need one that is
// guaranteed not to match.
var noMatch = /(.)^/;

// Certain characters need to be escaped so that they can be put into a
// string literal.
var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
};

var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

function requirePartial(partialPath){
    var content = file.read(partialPath);
    return template(content).source;
}

/**
 * @module template
 * @summary Compiles templates into strings
 */

/**
 * Compiles templates into strings
 * @method template(text, data, settings)
 * @example
 *  template("hello <%= foo %>", {foo:"modjs"}) // => hello modjs
 */
var template = module.exports = function template(text, data, settings) {

    var render;
    settings = settings || template.settings;

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
        (settings.include || noMatch).source,
        (settings.escape || noMatch).source,
        (settings.interpolate || noMatch).source,
        (settings.evaluate || noMatch).source // evaluate 的正则需放置在最后
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, include, escape, interpolate, evaluate, offset) {
        source += text.slice(index, offset)
            .replace(escaper, function(match) { return '\\' + escapes[match]; });

        if (include) {
            // default include format: <%@ header.html:context %>
            var includes = include.trim().split(":");
            var context = includes[1] || '';
            // partials must be ready before
            source += "'+\n(" + requirePartial(includes[0]) + ")("+ context +")+\n'";
        }
        if (escape) {
            source += "'+\n((__t=(" + escape + "))==null?'':escape(__t))+\n'";
        }
        if (interpolate) {
            source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
        }
        if (evaluate) {
            source += "';\n" + evaluate + "\n__p+='";
        }

        index = offset + match.length;
        return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
        "print=function(){__p+=__j.call(arguments,'');},\n" +
        (settings.escaper? "escape=function(s){return s.replace(/[<>\"\'/]/g,function(m){return {'<':'&lt;','>': '&gt;','\"': '&quot;','\'': '&#x27;','/': '&#x2F;'}[m]})};\n": "escape=" + settings.escaper + ";\n") +
        source + "return __p;\n";

    try {
        render = new Function(settings.variable || 'obj', '_', source); 
    } catch (e) {
        e.source = source;
        throw e;
    }

    if (data) return render(data, _);
    var templating = function(data) {
        return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    templating.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return templating;
};

/**
 * By default, uses ERB-style template delimiters, change the following template settings to use alternative delimiters.
 * @property template.settings
 */
template.settings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g,
    include      : /<%@([\s\S]+?)%>/g
};

/**
 * Helpers can be accessed from any context in a template
 * @method template.registerHelper(name, helper)
 * @example
 *   template.registerHelper("echo", function(val){
 *       console.log(val);
 *   })
 */
template.registerHelper = function(name, helper){
    var helpers = require('../runner').loadTask('template').helpers;
    return helpers[name] = helper;
};