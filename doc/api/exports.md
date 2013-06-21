## <a href="#exports" name="exports">exports</a>
> exports to task API


### Properties

#### exports.taskName
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> current task's name</p>
<hr>

#### exports.file
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> file </p>
<hr>

#### exports._
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> _ </p>
<hr>

#### exports.async
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> async </p>
<hr>

#### exports.request
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> request </p>
<hr>

#### exports.prompt
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> prompt </p>
<hr>




### Methods

#### exports.loadTask(taskName)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> load a task</p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Return:</b> <code>{object}</code></p>

<hr>

#### exports.runTask(name [, options] [, callback])
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> run task</p>


<hr>

#### exports.runTargets(targets [, callback])
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> run targets</p>


<hr>

#### exports.getArgs()
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> get command line arguments</p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Return:</b> <code>{array}</code></p>

<hr>

#### exports.getConfig([name])
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> get peoject config</p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Return:</b> <code>{*}</code></p>

<hr>

#### exports.getTaskConfig(taskName)
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> get task config</p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Return:</b> <code>{[type]}</code></p>

<hr>

#### exports.log(arg1 [,arg2...])
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> print log</p>


<hr>

#### exports.debug(arg1 [,arg2...])
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> print debug</p>


<hr>

#### exports.error(arg1 [,arg2...])
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> print error</p>


<hr>

#### exports.warn(arg1 [,arg2...])
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> print warning</p>


<hr>

#### exports.showHelp()
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> print task help</p>


<hr>

#### exports.getFiles()
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> return an array of all file paths that match the given wildcard patterns.</p>
<p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Return:</b> <code>{array} files array</code></p>

<hr>




