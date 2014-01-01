module.exports = {
    tasks: { 
        cat: {
            options: {
                // Task-level options may go here, overriding task defaults.
            },
            test: {
                options: {
                    // "bar" target options may go here, overriding task-level options.
                },
                group: [
                    {src: ['../catjs/foo.js', '../catjs/bar.js'], dest: './dist/foobar.js'},
                    {src: ['../catcss/foo.css', '../catcss/bar.css'], dest: './dist/foobar.css'},
                ]
            }
        }
    },
    targets: {
        dist: 'cat:test'
    }
};