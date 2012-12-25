var format = require('../utils/format');


exports.summary = 'Build tasks';


exports.usage = '[task...]';


exports.run = function (options, callback) {

    var tasks = options._.slice(1);
    exports.runTasks(tasks.join(" "), callback);
};
