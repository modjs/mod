
var taskMap = {
    help: './tasks/help',
    min: './tasks/min',
    compile: './tasks/compile',
    // project tasks
    create: './tasks/create',
    init: './tasks/init',
    server: './tasks/server',
    rev: './tasks/rev',
    build: './tasks/build',
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





