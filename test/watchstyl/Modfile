// Modfile
// More info at https://github.com/modulejs/modjs/

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