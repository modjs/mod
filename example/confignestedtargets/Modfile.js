module.exports = {
    plugins: {
        echo: function(options){
            console.log(options.text)
        }
    },
    tasks: {
        echo: {
            text: "echo a echo"
        },
        cp: {
            options: {
                // Task-level options may go here, overriding task defaults.
                dest: './dist'
            },
            test: {
                options: {
                    // "bar" target options may go here, overriding task-level options.
                },
                group: [
                    {src: ['../catjs/foo.js', '../catjs/bar.js']},
                    {src: ['../catcss/foo.css', '../catcss/bar.css']},
                ]
            }
        }
    },
    targets: {
        dist: 'cp:test',
        default: ["dist", "echo"]
    }
};