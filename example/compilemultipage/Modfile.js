// Mod.js
// More info at https://github.com/modjs/mod/

module.exports = {
    tasks: {
        compile: {
            options: {
                baseUrl: 'js/lib',
                loader: 'requirejs',
                mainConfigFile: '../common.js'
            },
            common: {
                name: "../common",
                src: '../common.js',
                dest: './dist/js',
            },
            main1: {
                name: "app/main1",
                src: '../app/main1.js',
                dest: './dist/js/app/',
                exclude: ['../common']
            },
            main2: {
                name: "app/main2",
                src: '../app/main2.js',
                dest: './dist/js/app/',
                exclude: ['../common']
            }
        },
        cp : {
            src: '*.html',
            dest: './dist'
        }
        
    },
    targets: {
        dist: "compile cp"
    }
};