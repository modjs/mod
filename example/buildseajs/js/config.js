seajs.config({
    // Enable plugins
    plugins: ['shim'],

    // Configure alias
    alias: {
        'jquery': {
            src: 'http://code.jquery.com/jquery-1.9.1.min.js',
            exports: 'jQuery'
        }
    }
});