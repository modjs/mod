var prompt = require('prompt'),
    url = require('url'),
    urlFormat = url.format,
    urlParse = url.parse,
    logger = require('./logger');

/**
 * Used by tasks wanting to add auth info to a URL. It will only prompt for
 * a password if the URL has a username, but no password associated with it.
 * Optionally you can force an auth prompt if the url has no auth data at all
 * by setting force to true.
 * @param url
 * @param force
 * @param callback
 * @returns {*}
 */
exports.completeAuth = function (url, force, callback) {
    var parsed = urlParse(url);
    if (parsed.auth) {
        // if only a username has been specified, ask for password
        if (parsed.auth.split(':').length === 1) {
            return exports.getAuth(url, callback);
        }
    }
    else if (force) {
        // no auth info, but auth required
        return exports.getAuth(url, callback);
    }
    callback(null, url);
};


exports.catchAuthError = function (fn, url, extra_args, callback) {
    fn.apply(null, [url].concat(extra_args).concat(function (err) {
        if (err && err.response && err.response.statusCode === 401) {
            logger.error(err.message || err.toString());
            exports.getAuth(url, function (err, url) {
                if (err) {
                    return callback(err);
                }
                console.log('');
                exports.catchAuthError(fn, url, extra_args, callback);
            });
        }
        else {
            callback.apply(this, arguments);
        }
    }));
};

exports.getPassword = function (callback) {
    process.stdout.write('Password: ');
    if (!prompt.started) {
        prompt.start();
    }
    prompt.readLineHidden(callback);
};

exports.getUsername = function (callback) {
    process.stdout.write('Username: ');
    if (!prompt.started) {
        prompt.start();
    }
    prompt.readLine(callback);
};

exports.getAuth = function (url, callback) {
    var parsed = urlParse(url);
    // if a username has been specified, only ask for password
    if (parsed.auth && parsed.auth.split(':').length === 1) {
        console.log('Please provide credentials for: ' + url);
        exports.getPassword(function (err, password) {
            if (err) {
                return callback(err);
            }
            delete parsed.host;
            parsed.auth += ':' + password;
            console.log('');
            callback(null, urlFormat(parsed));
        });
    }
    else {
        delete parsed.auth;
        delete parsed.host;
        var noauth = exports.noAuthURL(url);
        console.log('Please provide credentials for: ' + noauth);
        exports.getUsername(function (err, username) {
            if (err) {
                return callback(err);
            }
            exports.getPassword(function (err, password) {
                if (err) {
                    return callback(err);
                }
                parsed.auth = username + ':' + password;
                callback(null, urlFormat(parsed));
            });
        });
    }
};



/**
 * Used by tasks wanting to report a URL on the command-line without giving
 * away auth info.
 * @param url
 * @returns {*}
 */
exports.noAuthURL = function (url) {
    var parts = urlParse(url);
    delete parts.auth;
    delete parts.host;
    return urlFormat(parts);
};