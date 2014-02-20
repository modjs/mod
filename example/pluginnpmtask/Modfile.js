// Mod.js
// More info at https://github.com/modjs/mod/

module.exports = {
    plugins: {
        stylus: "mod-stylus"
    },
    tasks: {
        stylus: {
            src: "test.styl",
            dest: "dist/test.css"
        }
    }
};