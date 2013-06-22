var _ = require('underscore');

/**
 * Return an options object with the specified defaults overriden by task-specific overrides, 
 * via the "options" property.
 * @return {object}
 */
exports.extend = function(taskLevelOptions, groupLevelOptions, targetLevelOptions) {
  var args = [{}].concat(_.toArray(arguments));
  return _.extend.apply(null, args);
};