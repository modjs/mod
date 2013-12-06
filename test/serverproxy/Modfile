
module.exports = {
    tasks: {
        server: {
            proxies: [
                {
                    location: "/cgi-bin/",
                    host: "127.0.0.1"
                },
                {
                    location: "/cgi-bin2/",
                    host: "127.0.0.1",
                    rewrite: {
                        '/cgi-bin2/test': '/rest/test1',
                        '/cgi-bin2/test2': '/rest/test2'
                    }
                },
                {
                    location: "/js/",
                    // root specifies the document root for the requests
                    // For exampleL, the request "/js/test.js" will return the file "./dist/js/test.js".
                    root: "./dist"
                },
                {
                    location: "/images/",
                    // alias specifies a path to be used as the basis for serving requests for the indicated location
                    // For exampleL, the request "/images/test.png" will return the file "./img/test.png".
                    alias: "./img"
                },
                {
                    location: "/index2.html",
                    file: "./index.html"
                }
            ]
        }
    }
};