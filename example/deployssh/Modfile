module.exports = {
    tasks:{
        watch: {
            src: './dist/',
            tasks: 'deploy'
        },
        deploy: {
            src: './dist/',
            dest: 'username:password@host:path' // replace with your own ssh server
        }
    },

    targets: {
        default: 'deploy watch'
    }
};
