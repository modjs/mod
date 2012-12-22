/*
 * property-prompt.js: Example of using prompt with complex properties.
 *
 * (C) 2010, Nodejitsu Inc.
 *
 */

var prompt = require('../lib/prompt');

var schema = {
  properties: {
    tags: {
      type: 'array',
      length: 3
    }
  }
};

prompt.start();

prompt.get(schema, function (err, result) {
  console.log('Command-line input received:');
  console.log('  tags: %j', result.tags);
});
