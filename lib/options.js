var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var async = require("async");
var utils = require('./utils');
var format = require('./utils/format');
var logger = require('./utils/logger');
var file = require("./utils/file");
var config = require('./config');
var project = require('./project');
var plugins = require('./plugins');

var cwd = process.cwd();



/**
 * Return an options object with the specified defaults overriden by task-specific overrides, 
 * via the "options" property.
 * @return {object}
 */
exports.extend = function(taskLevelOptions, groupLevelOptions, targetLevelOptions) {
  var args = [{}].concat(_.toArray(arguments));
  return _.extend.apply(null, args);
};