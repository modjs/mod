var target = /* #if @target dev */ 'dev' /* #endif */ /* #if @target default /  'default' /* #endif */

/* #if @target dev */
alert(target)
/* #endif */
/* #if @target default /
console.log(target)
/* #endif */

