
var taskMap = {
    help: './tasks/help',
    // module tasks
    search: './tasks/search',
    install: './tasks/install',
    update: './tasks/update',
    uninstall: './tasks/uninstall',
    clean: './tasks/clean',
    ls: './tasks/ls',
    'clear-cache': './tasks/clear-cache',
    // publish: './tasks/publish',
    // unpublish: './tasks/unpublish',
    link: './tasks/link',
    rebuild: './tasks/rebuild',

    // static resource tasks
    min: './tasks/min',
    // optimage: './tasks/optimage',
    // cleancss: './tasks/cleancss',
    // uglifyjs: './tasks/uglifyjs',
    // htmlminifier: './tasks/htmlminifier',
    lint: './tasks/lint',
    // csslint: './tasks/csslint',
    // jshint: './tasks/jshint',

    // combincss: './tasks/combincss',
    compile: './tasks/compile',

    // project tasks
    create: './tasks/create',
    init: './tasks/init',
    server: './tasks/server',
    pack: './tasks/pack',
    hash: './tasks/hash',
    build: './tasks/build',
    // deploy: './tasks/deploy',
    // watch: './tasks/watch',

    // file tasks
    replace: './tasks/replace',
    cat: './tasks/cat',
    cp: './tasks/cp',
    mkdir: './tasks/mkdir',
    mv: './tasks/mv',
    rm: './tasks/rm',
    strip :'./tasks/strip'
};


exports.getTaskList = function(){
    return Object.keys(taskMap);
};

exports.getTasks = function(){
    var tasks = {};
    exports.getTaskList().forEach(function(taskName){
        var path = taskMap[taskName];
        tasks[taskName] = require(path);
    });
    return tasks;
};





