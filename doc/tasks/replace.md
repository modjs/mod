## <a href="#replace" name="replace">replace</a>
> Replace the contents of files

### Usage

```sh
$ mod replace <src> [options]
```

### Options

#### dest

<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Default:</b> <code><src></code></p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Destination directory or file</p>
<hr>

#### search


<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> A string or regular expression that will be replaced by the new value</p>
<hr>

#### replace


<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> A string that replaces the search string or a function to be invoked to create the new string</p>
<hr>

#### flags

<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Default:</b> <code>gm</code></p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> A String containing any combination of the RegExp flags: g - global match, i - ignore case, m - match over multiple lines. This parameter is only used if the search parameter is a string</p>
<hr>

#### output

<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Default:</b> <code>file</code></p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Specify output type: file pipe</p>
<hr>

#### charset

<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Default:</b> <code>utf-8</code></p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> File encoding type</p>
<hr>







