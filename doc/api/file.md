## <a href="#file" name="file">file</a>
> There are many provided methods for reading and writing files, traversing the filesystem and finding files by matching globbing patterns. Many of these methods are wrappers around built-in Node.js file functionality, but with additional error handling, logging and character encoding normalization.




### Methods

#### file.exists(filepath)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> file exists</p>


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
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> file suffix append</p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Return:</b> <code>{*}</code></p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Example:</b></p>
```js
file.suffiex("jquery.js", "min") // => jquery.min.js
```

<hr>

#### file.isDir(filepath)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Is the given path a directory? Returns a boolean.</p>


<hr>

#### file.isDirFormat(filepath)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> is dir format</p>


<hr>

#### file.listdir(dir, callback)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> list directories within a directory. Filters out regular files andsubversion .svn directory (if any).</p>


<hr>

#### file.glob(pattern [, rootdir])
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> get the pattern matched files, default root dir is cwd</p>


<hr>

#### file.delete(filepath)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Delete the specified filepath. Will delete files and folders recursively.</p>


<hr>

#### file.read(filepath [, encoding])
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Read and return a file's contents.</p>


<hr>

#### file.write(filepath, contents [, encoding])
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> write the specified contents to a file, creating intermediate directories if necessary</p>


<hr>

#### file.writeTemp(filepath, contents [, encoding])
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> write the specified contents to a temp file</p>


<hr>

#### file.copy(src, dest)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> copy a source file or directory to a destination path, creating intermediate directories if necessary</p>


<hr>

#### file.find(dirpath, filename);
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> search for a filename in the given directory or all parent directories.</p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Return:</b> <code>{string}</code></p>

<hr>

#### file.mkdir(dirpath [, mode])
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> given a path to a directory, create it, and all the intermediate directories as well</p>

<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Example:</b></p>
```js
file.mkdir("/tmp/dir", 755)
```

<hr>

#### file.mkdirTemp([dirname] [, mode])
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> create temp dir</p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Return:</b> <code>{string}</code></p>

<hr>

#### file.walkdir(rootdir, callback)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> recurse into a directory, executing callback for each file.</p>

<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Example:</b></p>
```js
file.walkdir("/tmp", function(error, path, dirs, name) {
// path is the current directory we're in
// dirs is the list of directories below it
// names is the list of files in it
})
```

<hr>




