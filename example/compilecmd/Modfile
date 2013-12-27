module.exports = {
    tasks: {
        compile:{
            options: {
                loader: 'seajs'
            },
            // do not combine all require module
            demo1: {
                src: "./js/*.js",
                dest: "./dist/js/",
                combine: false
            },
            demo2: {
                src: "./js/main.js",
                dest: "./dist/js2/",
                mainConfigFile: "./js/config.js"
            }
        }
    },
    targets: {
        dist: "compile"
    }
};