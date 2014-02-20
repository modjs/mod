// Mod.js
// More info at https://github.com/modjs/mod/

module.exports = {
    plugins: {
        concat: "grunt-contrib-concat@0.3.0"
    },
    tasks: {
        concat: {
            options: {
              separator: '/* separator */',
            },
            dist: {
              src: ['foo.js', 'bar.js'],
              dest: 'dist/foobar.js',
            },
        }
    }
};