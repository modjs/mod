# volo-ghdeploy

A [volo](https://github.com/volojs/volo) command for deploying a directory to
[GitHub Pages](http://pages.github.com/).

## Installation

Install this command via npm into a project's local node_modules directory:

    npm install volo-ghdeploy

Then, in the volofile for the project, create a volo command name that
does a require() for this command, and pass it the buildDir and pagesDir to use:

```javascript
//in the volofile
module.exports = {
    //Creates a local project command called ghdeploy
    ghdeploy: require('volo-ghdeploy')('www-built', 'www-ghdeploy')
}
```

## Usage

While in the project directory, just type:

    volo ghdeploy

To deploy the code to github. You may be prompted the first time you run it
for information on how to connect to github and what repo to use.

ghdeploy will create the repo if it does not exist.

## License

MIT and new BSD.
