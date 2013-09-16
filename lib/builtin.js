var taskMap = {
    help: './tasks/help',
    build: './tasks/build',
    // helper tasks
    init: './tasks/init',
    server: './tasks/server',
    watch: './tasks/watch',
    deploy: './tasks/deploy',
    download: './tasks/download',
    // base tasks
    compile: './tasks/compile',
    min: './tasks/min',
    replace: './tasks/replace',
    cat: './tasks/cat',
    cp: './tasks/cp',
    mkdir: './tasks/mkdir',
    mv: './tasks/mv',
    rm: './tasks/rm',
    rev: './tasks/rev',
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
