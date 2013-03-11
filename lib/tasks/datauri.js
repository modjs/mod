var fs = require('fs');
var path = require('path');
var url = require("url");
var http = require("http");

exports.summary = 'Image URL to DataURI';

exports.usage = '<source> [options]';

exports.options = {
    "d" : {
        alias : 'dest'
        ,default : '<source>'
        ,describe : 'destination directory or file'
    },

    "i" : {
        alias : 'igts'
        ,default : false
        ,describe : 'ignore timestamp like sprite.png?v=20120918 '
    },

    "l" : {
        alias : 'limit'
        ,default : 1024 * 2
        ,describe : 'image size limit'
    },
    "c" : {
        alias : 'charset'
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
exports.run = function (opt, callback) {

    //console.log(args.argv);
    var source = opt.source,
        dest = opt.dest,
        igts = opt.igts,
        sizeLimit = opt.limit,
        charset = opt.charset;

    try {
        task(source, dest, path.dirname(source), igts, sizeLimit, charset);
        callback();
    }catch (err) {
        callback(err);
    }
};

var task = exports.task = function( inputFile, outputFile, basePath, igts, sizeLimit, charset){
        debugger;
        var input = fs.readFileSync(inputFile, charset).toString();
        var output = transform(input, basePath,  igts, sizeLimit, charset);
        fs.writeFileSync(outputFile, output, charset);

};

/**
 * transform the image url to base64 in the css.
 *
 * background-image:url(data:image/png;base64,[base64 string])
 * border-image:url(data:image/png;base64,[base64 string])
 */
var transform = exports.transform = function (input, basePath, igts, sizeLimit, charset) {


    var imgReg = /(?:background|border).*url\(\s*\"?\'?(\S*)\.(png|jpg|jpeg|gif)\"?\'?\s*\).+/gi;

    if(igts) imgReg = /(?:background|border).*url\(\s*\"?\'?(\S*)\.(png|jpg|jpeg|gif).*\"?\'?\s*\).+/gi


    input = input.replace(imgReg, function (match, file, type) {

        var fileName = basePath + "/" + file + '.' + type;

        if(fs.existsSync(fileName)){

            // The jpe, jpg, jpeg image MIME type is image/jpeg
            var uriPrefix = 'data:image/' + (type.indexOf('jp') === 0 ? 'jpeg' : type) + ';base64,' ;

            var body = fs.readFileSync(fileName, 'binary');
            var image = new Buffer(body, 'binary').toString('base64');

            if( image.length > 32 * 1024 ){
                exports.log(fileName , "base64 length larger then 32K" );
            }

            image = 'url("'+ uriPrefix + image + '")';

            var r = match.replace(/url\(\s*\"?\'?(\S*)\.(png|jpg|jpeg|gif|svg\+xml)\"?\'?\s*\)/i, image);

            exports.log( "Success convert Image URL("+ fileName.grey +") to DataURI" );

            return r;

        }else{
            exports.warn("Failed convert Image URL("+ fileName.grey +") to DataURI, because it not exist" );
            return match;
        }

    });

    return input;

};



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
            data = new Buffer(data, "binary");
            done(null, encode(mime, data));
        });
    });

    req.on("error", function(err) {
        done("Unable to convert " + img + ". Error: " + err.code);
    });

    req.end();
}

/**
 * Base64 encodes an image and builds the data URI string
 *
 * @param mimeType Mime type of the image
 * @param img The source image
 * @return Data URI string
 */
function encode(mimeType, img) {
    var ret = "data:";
    ret += mimeType;
    ret += ";base64,";
    ret += img.toString("base64");
    return ret;
}
