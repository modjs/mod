var utils = require('../.'),
    logger = require('../../utils/logger');

/**

 CACHE MANIFEST
 # rev 0

 NETWORK:
 # resources you never want cached go here

 CACHE:
 # images


 # JavaScripts
 js/year.js
 js/jquery-1.6.1.js

 # stylesheets


 */
exports.summary = '静态分析生成 manifest 文件，默认使用绝对路径';

exports.usage = '' +
    'mod manifest [D]\n' +
    '\n' +
    'Parameters:\n' +
    '  COMMAND      The mod command to show help on\n' +
    '\n' +
    'Available tasks:\n';


exports.run = function () {

};
