
module.exports = {
    plugins: {
        tar: "mod-tar"
    },
    tasks: {
        download: {
            jquery: {
                src: ["http://code.jquery.com/jquery-1.8.2.js"],
                dest: "./dist/js"
            },
            github: {
                src: "jquery/jquery",
                dest: "./dist/lib/jquery"
            }
        }
    },
    targets: {
        dist: "download"
    }
};
