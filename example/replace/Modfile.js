module.exports = {
    tasks: {
        replace: {
            string: {
                src: "foo.js",
                dest: "dist/foo.js",
                search: "TIMESTAMP",
                replace: +new Date
            },
            regexp: {
                src: "dist/foo.js",
                search: /DEBUG/g,
                replace: true
            },
            func: {
                src: "dist/foo.js",
                search: /v(\d+)/,
                replace: function(match, v){
                    var v = Number(v);
                    return 'v' + ++v
                }
            }
        }
    },
    targets: {
        default: "replace"
    }
};