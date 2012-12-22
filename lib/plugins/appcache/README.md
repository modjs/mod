# volo-appcache

A [volo](https://github.com/volojs/volo) command for generating an appcache
manifest.

## Installation

Install this command via npm into a project's local node_modules directory:

    npm install volo-appcache

Then, in the volofile for the project, create a volo command name that
does a require() for this command, and pass it the following allowed options:

```javascript
//in the volofile
module.exports = {
    //Existing build command, not required to use volo-appcache
    build: function () {},

    //Creates a local project command called appcache
    appcache: require('volo-appcache')({
        //Optional array of volofile commands to run before executing
        //this command
        depends: ['build'],

        //The directory to use for the manifest
        //The manifest.appcache will be written
        //inside this directory. Default value is
        //shown:
        dir: 'www-built',

        //The path to the HTML file to modify to add the
        //`manifest` attribute. Path is assumed to be inside
        //the `dir` option mentioned above. Default value
        //is shown:
        htmlPath: 'index.html',

        //The path to the template file to use for the manifest
        //It defaults to the 'manifest.template' file in this
        //directory. Be aware, the volo-appcache command assumes
        //there are some tokens in the file that can be replaced
        //with the file listing and the digest stamp. See
        //manifest.template for an example.
        manifestTemplate: ''
    })
}
```

## Usage

While in the project directory, just type:

    volo appcache

To generate the manifest.appcache in the directory specified above. It will
use a digest of all the file contents to stamp the manifest.appcache for
changes, and it will modify the htmlPath file listed above to include the
`manifest` attribute on the html tag.

## License

MIT and new BSD.
