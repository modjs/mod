## <a href="#cp" name="cp">cp</a>
> Copy one or more files to another location

### Usage

```sh
$ mod cp <source> [options]
```

### Options

#### dest


<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> destination directory or file</p>
<hr>

#### parent
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Type:</b> <code>boolean</code></p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Default:</b> <code>false</code></p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> include source parent directory</p>
<hr>

#### filter


<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> a RegExp instance, against which each file name is tested to determine whether to copy it or not, or a function taking single parameter: copied file name, returning true or false, determining whether to copy file or not.</p>
<hr>







