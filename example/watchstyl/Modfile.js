// Modfile
// More info at https://github.com/modjs/mod/

module.exports = {
    plugins: {
        stylus: "mod-stylus"
    },
    tasks: {
        stylus: {
            src: "./styl/*.styl",
            dest: "./css/"
        },
        watch: {
            tasks: ['stylus']
        }
    },
    targets: {
        default: "stylus watch"
    }
};