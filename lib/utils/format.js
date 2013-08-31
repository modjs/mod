/**
 * 12345 => 12,345
 * @param str
 * @return {String}
 */
exports.commify= function(str) {
    return String(str)
        .split('').reverse().join('')
        .replace(/(...)(?!$)/g, '$1,')
        .split('').reverse().join('');
};

/**
 * Pads a string to minlength by appending spaces.
 * @param str
 * @param minlength
 * @returns {*}
 */
exports.padRight = function (str, minlength) {
    while (str.length < minlength) {
        str = str + ' ';
    }
    return str;
};

/**
 *
 * @param arr
 * @returns {*}
 */
exports.longest = function (arr) {
    return arr.reduce(function (a, x) {
        if (x.length > a) {
            return x.length;
        }
        return a;
    }, 0);
};

/**
 *
 * @param str
 * @param max
 * @returns {*}
 */
exports.truncate = function (str, max) {
    if (str.length <= max) {
        return str;
    }
    return str.substr(0, max - 1) + '…';
};

/**
 *
 * @param str
 * @param suffix
 * @returns {boolean}
 */
exports.endsWith = function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

var templateRegExp = /\{\{\s*(\w+)\s*\}\}/g;

/**
 *
 * @param contents
 * @param data
 * @returns {*}
 */
exports.template = function template(contents, data) {
    return contents.toString().replace(templateRegExp, function (match, token) {
        var result = data[token];

        //Just use empty string for null or undefined
        if (result === null || result === undefined) {
            result = '';
        }

        return result;
    });
};

/**
 *
 * @param str
 */
exports.camelize = function(str){
    str.trim().replace(/[-_\s]+(.)?/g, function(match, c){
        return c.toUpperCase();
    })
};

/**
 *
 * @param str
 * @returns {string}
 */
exports.ucfirst = function(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
};
