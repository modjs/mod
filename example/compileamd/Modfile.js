// A sample Modfile
// More info at https://github.com/modulejs/modjs/

module.exports = {
    tasks: {
        compile: {
            options: {
                loader: 'requirejs',
                baseUrl: './js',
                dest: './dist/js'
            },
            mainModule: {
                src: 'main.js',
            },
            asyncModule: {
                src: 'asyncModule.js',
                exclude: ['./var/navigator']
            }
        },
        cp: {
            src: '*.html',
            dest: './dist'
        }
    },
    
    targets: {
        dist: "compile cp"
    }
};