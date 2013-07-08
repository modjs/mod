var path = require('path');

exports.summary = 'licenses generator';

exports.options = {
    licenses: {
        message: 'Licenses',
        default: 'MIT'
    },
    copyright_year: {
        message: "Copyright year",
        default: new Date().getFullYear()
    },
    copyright_holders: {
        message: 'Copyright holders',
        default: "{{author_name}}"
    }
};

exports.run = function (options) {
    var license = options.licenses;

    var licenses = {
        "apache": "Apache-2.0",
        "apache2": "Apache-2.0",
        "apache-2.0": "Apache-2.0",
        "gpl": "GPL-2.0t",
        "gpl2": "GPL-2.0t",
        "gpl-2.0": "GPL-2.0",
        "mpl": "MPL-2.0",
        "mpl-2.0": "MPL-2.0",
        "mpl2": "MPL-2.0",
        "mit": "MIT"
    };

    var license_type = licenses[license.toLowerCase()];
    if (license_type) {
        exports.templateData['license_type'] =  license_type;
        var license_file = license_type + "-LICENSE.txt";
        exports.templateData['license_url'] =  "{{homepage}}/blob/master/" + license_file;
        exports.copyTemplate( license_file );
    } else {
        exports.templateData['license_type'] =  license;

    }
};