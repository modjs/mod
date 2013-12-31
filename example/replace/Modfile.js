module.exports = {
    tasks: {
        replace: {
            string: {
                src: "foo.js",
                dest: "foo.replaced.js",
                search: "TIMESTAMP",
                replace: +new Date
            },
            regexp: {
                src: "foo.replaced.js",
                search: /DEBUG/g,
                replace: true
            },
            func: {
                src: "foo.replaced.js",
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