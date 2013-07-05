## <a href="#template" name="template">template</a>
> Compiles templates into strings


### Properties

#### template.settings
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> By default, uses ERB-style template delimiters, change the following template settings to use alternative delimiters.</p>
<hr>




### Methods

#### template(text, data, settings)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Compiles templates into strings</p>

<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Example:</b></p>
```js
template("hello <%= foo %>", {foo:"modjs"}) // => hello modjs
```

<hr>

#### template.registerHelper(name, helper)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Helpers can be accessed from any context in a template</p>

<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Example:</b></p>
```js
 template.registerHelper("echo", function(val){
     console.log(val);
 })
```

<hr>




