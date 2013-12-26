## <a href="#utils" name="utils">utils</a>
> miscellaneous utilities




### Methods

#### utils.getHttpProxy( hostname )
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Get the system's http proxy</p>


<hr>

#### utils.isRelativeURI(uri)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Is a relative URI?</p>

<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Example:</b></p>
```js
 utils.isRelativeURI("../path/to"); // => return true
 utils.isRelativeURI("path/to"); // => return true
 utils.isRelativeURI("#id"); // => return false
 utils.isRelativeURI("http://www.qq.com"); // => return false
 utils.isRelativeURI("/relative/to/root"); // => return false
 utils.isRelativeURI("//without/protocol"); // => return false
 utils.isRelativeURI("data:image/gif;base64,lGODlhEAA..."); // => return false
```

<hr>

#### utils.download(url, local, callback)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Download file</p>


<hr>

#### utils.isPlainObject(obj)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Check to see if an object is a plain object (created using “{}” or “new Object”).</p>


<hr>

#### utils.clone(obj)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Deep copy of the object</p>


<hr>

#### utils.walk(value, fn, fnContinue)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Recurse through objects and arrays, executing fn for each non-object.</p>


<hr>

#### utils.namespace(obj, parts, create)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Get the value of a deeply-nested property exist in an object.</p>


<hr>

#### utils.merge(a, b)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Deep merge for JSON objects, overwrites conflicting properties</p>


<hr>

#### utils.arrayify()
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Convert 'a,b,c' to [a,b,c]</p>


<hr>

#### utils.getVersion()
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Reads the version property from modjs's package.json</p>


<hr>

#### utils.open(target, appName, callback)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Open application</p>


<hr>




