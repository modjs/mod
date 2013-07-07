var path = require('path');

exports.summary = 'licenses generator';

exports.options = {
  licenses: {
    message: 'Licenses',
    default: 'MIT'
  },
  author_name: {
    message: 'Author name',
    default: process.env.USER || process.env.USERNAME
  },
  copyright_year: {
    message: "Copyright year",
    default: new Date().getFullYear()
  }
};

exports.run = function (options) {
    var license = options.licenses;
    
    var licenses = {
      "apache2" : "Apache-2.0-LICENSE.txt",
      "apache-2.0" : "Apache-2.0-LICENSE.txt",
      "gpl2" : "GPL-2.0-LICENSE.txt",
      "gpl-2.0" : "GPL-2.0-LICENSE.txt",
      "mpl-2.0" : "MPL-2.0-LICENSE.txt",
      "mpl2" : "MPL-2.0-LICENSE.txt",
      "mit" : "MIT-LICENSE.txt"
    };

    license = licenses[license.toLowerCase()];
    if(license) exports.copyTemplate( license );
};