## <a href="#exports" name="exports">exports</a>
> The exports API


### Properties

#### exports.taskName
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Current task's name</p>
<hr>

#### exports.template
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Compiles templates into strings</p>
<hr>

#### exports.utils
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Miscellaneous utilities</p>
<hr>

#### exports.file
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Provided many methods for reading and writing files, traversing the filesystem and finding files by matching globbing patterns. Many of these methods are wrappers around built-in Node.js file functionality, but with additional error handling, logging and character encoding normalization.</p>
<hr>

#### exports._
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Tons of super-useful array, function and object utility methods.</p>
<hr>

#### exports.async
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Async utilities for node and the browser</p>
<hr>

#### exports.request
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Simplified HTTP request method</p>
<hr>

#### exports.prompt
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Using prompt is relatively straight forward. There are two core methods you should be aware of: prompt.get() and prompt.addProperties(). There methods take strings representing property names in addition to objects for complex property validation (and more).</p>
<hr>

#### exports.files
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> An array of all file paths that match the given wildcard patterns.</p>
<hr>




### Methods

#### exports.loadTask(taskName)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Load a task</p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Return:</b> <code>{object}</code></p>

<hr>

#### exports.runTask(name [, options] [, callback])
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Run task</p>


<hr>

#### exports.runTargets(targets [, callback])
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Run targets</p>


<hr>

#### exports.config([name])
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Get peoject config</p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Return:</b> <code>{*}</code></p>

<hr>

#### exports.log(arg1 [,arg2...])
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Print log</p>


<hr>

#### exports.debug(arg1 [,arg2...])
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Print debug</p>


<hr>

#### exports.error(arg1 [,arg2...])
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Print error</p>


<hr>

#### exports.warn(arg1 [,arg2...])
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Print warning</p>


<hr>

#### exports.help()
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> Print task help</p>


<hr>




