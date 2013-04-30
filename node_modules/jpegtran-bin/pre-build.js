'use strict';
var Mocha = require('mocha');
var colors = require('colors');
var build = require('./build.js');
var mocha = new Mocha({ui: 'bdd', reporter: 'list'});

mocha.addFile('test/test-jpegtran-path.js');

mocha.run(function (failures) {
	if (failures > 0) {
		build();
	} else {
		console.log('pre-build test passed successfully, skipping build'.green);
	}
});
