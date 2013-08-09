## <a href="#strip" name="strip">strip</a>
> Source stripping

### Usage

```sh
$ mod strip <src> [options]
```

### Options

#### dest


<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Destination directory or file</p>
<hr>

#### charset

<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Default:</b> <code>utf-8</code></p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> File encoding type</p>
<hr>

#### bom
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Type:</b> <code>boolean</code></p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Default:</b> <code>true</code></p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Strip bom</p>
<hr>

#### tab

<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Default:</b> <code>false</code></p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Convert tab (default replace by 4 spaces if enable)</p>
<hr>

#### eol

<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Default:</b> <code>false</code></p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Convert line ending (default replace by lf if enable)</p>
<hr>

#### code

<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Default:</b> <code>false</code></p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Strip code (default remove alert call if enable)</p>
<hr>

#### output

<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Default:</b> <code>file</code></p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Specify output type: file pipe</p>
<hr>







