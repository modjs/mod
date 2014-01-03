module.exports = {
    tasks: {
        cat: {
            test: {
                src: ['{{ qux.src }}', 'baz/*.js'],    // [['foo/*.js', 'bar/*.js'], 'baz/*.js']
                dest: 'dist/abc.js'                    // 'dist/abc.js'
            }
        },
        // Arbitrary properties used in task configuration templates.
        foo: 'foo',
        bar: '{{ foo }}/*', // 'foo/*'
        baz: '{{ bar }}.js', // 'foo/*.js'
        qux: {
            src: ['{{ baz }}', 'bar/*.js']
        }
    },
    targets: {
        dist: 'cat:test'
    }
};