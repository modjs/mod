module.exports = {
    tasks:{
        watch: {
            tasks: 'deploy'
        },
        deploy: {
            src: './dist/**/*',
            basedir: './dist/',
            token: 'private',
            dest: '/Users/yuanyan/Github/modjs/test/deployhttp/tmp',
            protocol: 'http',
            url: 'http://localhost:3000/upload'
        },
        server: {
            deploy: true,
            token: 'private'
        }
    },

    targets: {
        default: 'deploy watch',
        server: 'server'
    }
};
