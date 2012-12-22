module.exports = {
    help: require('./tasks/help'),
    // module tasks
    search: require('./tasks/search'),
    install: require('./tasks/install'),
    update: require('./tasks/update'),
    uninstall: require('./tasks/uninstall'),
    clean: require('./tasks/clean'),
    ls: require('./tasks/ls'),
    'clear-cache': require('./tasks/clear-cache'),
    //publish: require('./tasks/publish'),
    //unpublish: require('./tasks/unpublish'),
    link: require('./tasks/link'),
    rebuild: require('./tasks/rebuild'),

    // static resource tasks
    min: require('./tasks/min'),
//    optimage: require('./tasks/optimage'),
//    cleancss: require('./tasks/cleancss'),
//    uglifyjs: require('./tasks/uglifyjs'),
//    htmlminifier: require('./tasks/htmlminifier'),
    lint: require('./tasks/lint'),
//    csslint: require('./tasks/csslint'),
//    jshint: require('./tasks/jshint'),

//    combincss: require('./tasks/combincss'),
    compile: require('./tasks/compile'),

    // project tasks
    create: require('./tasks/create'),
    init: require('./tasks/init'),
    server: require('./tasks/server'),
    pack: require('./tasks/pack'),
    hash: require('./tasks/hash'),
    build: require('./tasks/build'),
    //deploy: require('./tasks/deploy'),
    //watch: require('./tasks/watch'),

    // file tasks
    replace: require('./tasks/replace'),
    cat: require('./tasks/cat'),
    cp: require('./tasks/cp'),
    mkdir: require('./tasks/mkdir'),
    mv: require('./tasks/mv'),
    rm: require('./tasks/rm'),
    strip : require('./tasks/strip')
};



