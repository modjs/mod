/**
 * 部署ria工程仿真环境
 * 注意: svn客户端需要1.6以上
 * */
var path = require('path');
var express = require('express');
var fs = require('fs');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var config = require('./config')();

process.on('uncaughtException', function(err) {
	console.error('Caught exception: ', err);
});
	
process.title = 'ria-deploy-server';//linux only

var pidPath = path.join(__dirname,'.pid');
fs.writeFile(pidPath, process.pid);

process.on('SIGTERM', function() {//SIGTERM是kill的信号
  fs.unlink(pidPath,function(){
  	console.log('ria deploy server killed');
  	process.exit(0);
  });
});

(function startServer() {
	var app = express.createServer();
	app.use(express.bodyParser());//解析post params
	app.use(app.router);

	deploy(app, config)

	app.use(express['static'](__dirname));
	app.use(express.directory(__dirname));

	app.listen(config.port);
	console.log('deploy server ' + process.pid + ' running on '+ config.port +' port...');
})();

function deploy(app, config) {
	app.get('/', function(req, res) {
		res.redirect('/deploy.html');
	});
	//部署工程
	app.post('/deploy', function(req, res) {
		res.writeHead(200, {
				'Content-Type' : 'text/html;charset=utf-8'
		});
		res.write('<script>window._timer_ = setInterval(function(){try{document.body.scrollTop = document.body.offsetHeight;}catch(e){}},50);</script>', 'utf-8');
			
		Task.svnExport(req, res);
	});
	
	//svn list
	app.get('/list/*', function(req, res) {
		res.writeHead(200, {
	  		'Content-Type': 'text/html;charset=utf-8' 
	  	});
		var project = req.url.split('/list/')[1].split('?')[0].trim();
		var name = req.param('name', null).trim();
		var passwd = req.param('password', null).trim();
		var location = config.svnRoot + project;
		var cmd = ['svn','ls','--non-interactive','--trust-server-cert','--username',name,'--password',passwd,location].join(' ');	
		exec(cmd,function(error, stdout, stderr){
			res.end(JSON.stringify({
				pid		: project,
				data	: stdout.trim().split('\n'),
				error	: stderr || '',
				code 	: stderr ? 0 : 1
			}, null, true) );
		});
	});
	
	var Task = {
		source:'',
		target:'',
		/**
		 * 检出svn,使用svn svnExport
		 * */
		svnExport:function(req, res){
			var name = req.param('name', null).trim();
			var passwd = req.param('password', null).trim();
			var svn = req.param('svn', null).trim();
			var target = req.param('target', null).trim();
			
			this.target = config.documentRoot + target;
			
			fs.writeFileSync("/tmp/_deploy_.txt", [name,svn,target,(new Date().toLocaleString())].join('\n'));
	
			var arr = svn.split('/');
			var source = this.source = path.join('/tmp/',name,target);
			
			Task.execute('rm',['-rf',source],req,res,function(req, res){//先清空临时输入目录
				Task.execute('mkdir',['-p',source],req,res,function(req, res){
					var params = ['export','--non-interactive','--trust-server-cert','--force','--username',name,'--password',passwd,svn,source];
					Task.execute('svn',params,req,res,function(req, res){
						Task.clear(req, res);
					});
				});
			});
		},
		/**
		 * 清除仿真机上对应的老ria工程
		 * */
		clear:function(req, res){
			var target = this.target;
			Task.execute('rm',['-rf', target],req,res,function(req,res,code){
				if(req.param('environment', null).trim() !== 'online'){
					var sep = path.sep || '/';
					var list  = Task.target.split(sep).filter(function(item) {
						return item !== '';
					});
					list.pop();
					target = path.join(sep,list.join(sep));
				}
				Task.execute('mkdir',['-p', target],req,res,function(req,res,code){
					if(req.param('environment', null).trim() === 'online'){
						Task.compress(req, res);
					}else{
						Task.move(req,res);
					}
				});
			});
		},
		/**
		 * 打包工程,压缩合并文件;用新打包的工程替换服务器目录下的老工程
		 * */
		compress:function(req, res){
			var jsPackager = path.resolve(path.join(__dirname,'../../js/main.js'))
			var cssPackager = path.resolve(path.join(__dirname,'../../css/main.js'));
			var projectPath = Task.target.replace(config.documentRoot,'');
			if(fs.existsSync(this.source + '/js/')){//打包js工程
				var params = [jsPackager, Task.source,Task.target,'-confspecial','-mangle','-squeeze','-verbose'];
			}else{//打包css工程,注意baseURL和-noMD5参数
				var params = [cssPackager, Task.source,Task.target,projectPath,'-verbose','-noMD5'];
			}
			var node = process.execPath || 'node';
			this.execute(node,params,req,res,function(req,res,code){
				Task.end(res,code);
			});
		},
		move:function(req,res){
			var sep = path.sep || '/';
			var list  = Task.target.split(sep).filter(function(item) {
				return item !== '';
			});
			list.pop();
			var target = path.join(sep,list.join(sep));
			Task.execute('mv',[Task.source, target],req,res,function(req,res,code){
				Task.end(res,code);
			});
		},
		execute:function(cmd,params, req,res,callback){
			var spawnedProcess = spawn(cmd,params);
			res.write('执行 ' + cmd + ' ' + params.join(' ') , 'utf-8');
			spawnedProcess.stdout.on('data', function(data) {
				data.toString().split('\n').forEach(function(line) {
					line && res.write('<li>' + line + '</li>', 'utf-8');
				});
			});
			spawnedProcess.stderr.on('data', function(data) {
				console.error('stderr: ' + data);
				res.write('<div style="color:red;font-weight:bold;">' + data + '</div>', 'utf-8');
			});
			spawnedProcess.on('exit', function(code) {
				console.log(cmd + ' process exited with code ' + code);
				var status = code == 1 ? '<div>命令执行失败!</div>' : '<div>命令执行成功!</div>';
				res.write(status, 'utf-8');
				if(code == 0){
					callback && callback(req,res,code);
				}else{
					res.end('<a href="/">返回</a>', 'utf-8');
				}
			});
		},
		end:function(res,code){
			var status = code == 0 ? '部署成功!' : '部署失败!';
			res.write('<a href="/" style="color:red;font-weight:bold;">' + status +' 返回部署首页</a>', 'utf-8');
			res.end('<script>clearInterval(window._timer_); document.body.scrollTop = document.body.offsetHeight;</script>', 'utf-8');
		}
	};
}