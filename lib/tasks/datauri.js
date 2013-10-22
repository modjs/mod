var fs = require('fs');
var path = require('path');
var url = require("url");
var http = require("http");

exports.summary = 'Inline image as DataURI';

exports.usage = '<src> [options]';

exports.options = {
    "dest" : {
        alias : 'd'
        ,default : '<src>'
        ,describe : 'destination directory or file'
    },

    "igts" : {
        alias : 'i'
        ,default : false
        ,describe : 'ignore timestamp like sprite.png?v=20120918'
    },

    "limit" : {
        alias : 'l'
        ,default : 1024 * 32
        ,describe : 'image size limit, IE8 has the lowest maximum data URI size of 32768 Bytes'
    },

    'output': {
        alias: 'o'
        ,default : 'file'
        ,describe : 'specify output type: file pipe'
    },

    "charset" : {
        alias : 'c'
        ,default : 'utf-8'
        ,describe : 'file encoding type'
    }
};

// Supports both local & remote images.
// Ability to specify a size limit. Default is 32kb, or IE8's limit.
// Existing data URIs will be ignored.
// Skip specific images by specifying a directive comment.
// Includes two helpers: encode_stylesheet to encode a stylesheet, and encode_image to encode an image.

// TODO fetch remote image
exports.run = function (options) {

    var source = options.src;
    var dest = options.dest;
    var igts = options.igts;
    var sizeLimit = options.limit;
    var output = options.output;
    var charset = options.charset;

    var file = exports.file;

    var result;
    exports.files.forEach(function(inputFile){
        if(output === 'file'){
            var outputFile = dest;
            if(file.isDirname(dest)){
                outputFile = path.join(dest , path.basename(inputFile) );
            }
        }
        result = exports.datauri(inputFile, outputFile, path.dirname(source), igts, sizeLimit, charset);
    });
    return result;
};

exports.datauri = function( inputFile, outputFile, basePath, igts, sizeLimit, charset){

    var filetype = exports.file.extname(inputFile);
    if(filetype === ".css"){
        var input = fs.readFileSync(inputFile, charset).toString();
        var output = exports.transform(input, basePath, igts, sizeLimit);
        fs.writeFileSync(outputFile, output, charset);
        return output;
    }else{
        var data = fs.readFileSync(inputFile, 'binary');
        var mime = getMimeType(filetype.slice(1));
        var datauri = encode(data, mime);
        return datauri;
    }

};

/**
 * transform the image url to base64 in the css.
 *
 * background-image:url(data:image/png;base64,[base64 string])
 * border-image:url(data:image/png;base64,[base64 string])
 */
exports.transform = function (input, basePath, igts, sizeLimit) {

    // do not replace comments
    var imgReg = /\/\*[\S\s]*?\*\/|(?:background|border|content).*url\(\s*\"?\'?(\S*)\.(png|jpg|jpeg|gif|webp|svg).*\"?\'?\s*\)/gi;

    if(igts) imgReg = /\/\*[\S\s]*?\*\/|(?:background|border|content).*url\(\s*\"?\'?(\S*)\.(png|jpg|jpeg|gif|webp|svg)\"?\'?\s*\)/gi;

    return input.replace(imgReg, function (match, file, type) {

        // ignore comments
        if(!file) return match;

        var filepath = basePath + "/" + file + '.' + type;

        if(fs.existsSync(filepath)){

            var data = fs.readFileSync(filepath, 'binary');
            var mime = getMimeType(type);
            var datauri = encode(data, mime);

            // IE8 has the lowest maximum data URI size of 32768 Bytes
            if( datauri.length > 32 * 1024 ){
                exports.warn(filepath, "data URI size is", datauri.length, "Bytes. IE8 has the lowest maximum data URI size of 32768 Bytes" );
            }

            datauri = 'url("'+ datauri + '")';

            var r = match.replace(/url\(\s*\"?\'?(\S*)\.(png|jpg|jpeg|gif|webp|svg).*\"?\'?\s*\)/i, datauri);
            exports.log( "Success convert Image URL("+ filepath.grey +") to DataURI" );

            return r;

        }else{
            exports.warn("Failed convert Image URL("+ filepath.grey +") to DataURI, because it not exist" );
            return match;
        }

    });

};

function getMimeType(type){
    var mimes = {
        'png' : 'image/png',
        'gif' : 'image/gif',
        'jpg' : 'image/jpeg',
        'jpeg' : 'image/jpeg',
        'webp' : 'image/webp',
        'svg' : 'image/svg+xml'
    };
    return mimes[type];
}


/**
 * Fetches a remote image and encodes it.
 *
 * @param img Remote path, like http://url.to/an/image.png
 * @param done Function to call once done
 */
function fetchImage(img, done) {
    var opts = url.parse(img);

    var req = http.request(opts, function(res) {
        res.setEncoding("binary");

        var mime = res.headers["content-type"];
        var data = "";

        // Bail if we get anything other than 200
        if(res.statusCode !== 200) {
            done("Unable to convert " + img + " because the URL did not return an image. Staus code " + res.statusCode + " received");
            return;
        }

        res.on("data", function(chunk) {
            data += chunk;
        });

        res.on("end", function() {
            done(null, encode(data, mime));
        });
    });

    req.on("error", function(err) {
        done("Unable to convert " + img + ". Error: " + err.code);
    });

    req.end();
}

/**
 * Base64 encodes an image and builds the data URI string
 * @return Data URI string
 */
function encode(data, mimeType) {
    // data:[<mime type>][;charset=<charset>][;base64],<encoded data>
    var datauri = "data:";
    datauri += mimeType;
    datauri += ";base64,";
    datauri +=  new Buffer(data, 'binary').toString('base64');
    return datauri;
}
