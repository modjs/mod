
module.exports = {
    tasks: {
        cp: {
            file: {
                src: ["../catjs/*.js", "../catcss/*.css"],
                dest: "./dist/a",
                filter: /foobar/
            },
            dir: {
                src: ["./dist/a/"],
                dest: "./dist/b"
            },
            subdir: {
                src: ["../catjs/foo.js"],
                dest: "./dist/b/bb",
                backup: false
            },
            fileAndDir: {
                src: ["./dist/b"],
                dest: "./dist/c"
            },
            fileAndDirFlatten: {
                src: ["./dist/b"],
                flatten: true,
                dest: "./dist/d"
            },
            flattenSrc: {
                src: ["./dist/b/**/*.js"],
                dest: "./dist/e"
            },
            fileCopyRoot: {
                src: "./dist",
                dest: "./dist/f"
            }
        }
    },
    targets: {
        default: "cp"
    }
};
