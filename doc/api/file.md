## <a href="#file" name="file">file</a>
> There are many provided methods for reading and writing files, traversing the filesystem and finding files by matching globbing patterns. Many of these methods are wrappers around built-in Node.js file functionality, but with additional error handling, logging and character encoding normalization.




### Methods

#### file.exists(filepath)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> File exists</p>


<hr>

#### file.isFile(filepath)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Is the given path a file? Returns a boolean.</p>


<hr>

#### file.isPlaintextFile(filepath)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Is the given path a plaintext file? Returns a boolean.</p>


<hr>

#### file.isUTF8EncodingFile(filepath)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Is the given path a UTF8 encoding file? Returns a boolean.</p>


<hr>

#### file.suffix(filename, suffix)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> File suffix append</p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Return:</b> <code>{*}</code></p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Example:</b></p>
```js
 file.suffiex("jquery.js", "min") // => jquery.min.js
```

<hr>

#### file.isDir(filepath)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Is the given path a directory? Returns a boolean.</p>


<hr>

#### file.isDirname(filepath)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Is dir format name</p>


<hr>

#### file.readJSON(filepath)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Read a file from the filesystem and parse as JSON</p>


<hr>

#### file.findPackageJSON
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Looks for a project's package.json file. Walks up the directory tree untilit finds a package.json file or hits the root. Does not throw when nopackages.json is found, just returns null.</p>


<hr>

#### file.readPackageJSON( [dir] )
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Read a package.json file's contents, parsing the data as JSON and returning the result</p>


<hr>

#### file.listdir(dir, callback)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> List directories within a directory.</p>


<hr>

#### file.glob(pattern [, rootdir])
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Get the pattern matched files, default root dir is cwd</p>


<hr>

#### file.expand(patterns [, options])
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Return a unique array of all file or directory paths that match the given globbing pattern(s).</p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Return:</b> <code>{array} matche files</code></p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Example:</b></p>
```js
   file.expand(['!./foo/.css', './foo/'])
```

<hr>

#### file.delete(filepath)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Delete the specified filepath. Will delete files and folders recursively.</p>


<hr>

#### file.read(filepath [, encoding])
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Read and return a file's contents.</p>


<hr>

#### file.write(filepath, contents [, encoding])
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Write the specified contents to a file, creating intermediate directories if necessary</p>


<hr>

#### file.writeTemp(filepath, contents [, encoding])
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Write the specified contents to a temp file</p>


<hr>

#### file.copy(src, dest)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Copy a source file or directory to a destination path, creating intermediate directories if necessary</p>


<hr>

#### file.find(dirpath, filename);
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Search for a filename in the given directory or all parent directories.</p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Return:</b> <code>{string}</code></p>

<hr>

#### file.mkdir(dirpath [, mode])
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Given a path to a directory, create it, and all the intermediate directories as well</p>

<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Example:</b></p>
```js
file.mkdir("/tmp/dir", 755)
```

<hr>

#### file.mkdirTemp([dirname] [, mode])
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Create temp dir</p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Return:</b> <code>{string}</code></p>

<hr>

#### file.walkdir(rootdir, callback)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Recurse into a directory, executing callback for each file.</p>

<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Example:</b></p>
```js
    file.walkdir("/tmp", function(error, path, dirs, name) {
        // path is the current directory we're in
        // dirs is the list of directories below it
        // names is the list of files in it
    })
```

<hr>




