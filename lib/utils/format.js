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
 *
 * @param {String} str
 * @param {Number} minlength
 * @return {String}
 * @api public
 */

exports.padRight = function (str, minlength) {
    while (str.length < minlength) {
        str = str + ' ';
    }
    return str;
};


exports.longest = function (arr) {
    return arr.reduce(function (a, x) {
        if (x.length > a) {
            return x.length;
        }
        return a;
    }, 0);
};

exports.ISODateString = function (d) {
    function pad(n){
        return n < 10 ? '0' + n : n;
    }
    return d.getUTCFullYear() + '-' +
        pad(d.getUTCMonth() + 1) + '-' +
        pad(d.getUTCDate()) + 'T' +
        pad(d.getUTCHours()) + ':' +
        pad(d.getUTCMinutes()) + ':' +
        pad(d.getUTCSeconds()) + 'Z';
};

exports.truncate = function (str, max) {
    if (str.length <= max) {
        return str;
    }
    return str.substr(0, max - 1) + '…';
};


exports.endsWith = function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
};



var tokenRegExp = /\{\{(\w+)\}\}/g;

exports.template = function template(contents, data) {
    return contents.replace(tokenRegExp, function (match, token) {
        var result = data[token];

        //Just use empty string for null or undefined
        if (result === null || result === undefined) {
            result = '';
        }

        return result;
    });
};


exports.camelize = function(str){
    str.trim().replace(/[-_\s]+(.)?/g, function(match, c){
        return c.toUpperCase();
    })
};

exports.ucfirst = function(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
};




