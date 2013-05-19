var esprima = require('esprima');

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
    /*jslint evil: true */
    var jsConfig, foundRange, foundConfig,
        astRoot = esprima.parse(fileContents, {
            range: true
        });

    traverse(astRoot, function (node) {
        var arg;

        if ( hasSeajsConfig(node) ) {

            arg = node['arguments'] && node['arguments'][0];

            if (arg && arg.type === 'ObjectExpression') {
                jsConfig = nodeToString(fileContents, arg);
                foundRange = arg.range;
                return false;
            }
        }

    });

    if (jsConfig) {
        foundConfig = eval('(' + jsConfig + ')');
    }

    return {
        data: foundConfig,
        range: foundRange
    };
}

//From an esprima example for traversing its ast.
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