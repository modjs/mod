(function(module) {
	var config = {
		//默认指向/data1/wwwroot/js.wcdn.cn
		'documentRoot'	: "/data1/wwwroot/js.wcdn.cn/",
		
		'port'			: 9999,

		'svnRoot'		: 'https://svn1.intra.sina.com.cn/weibo/ria/'

	module.exports = function() {
		return config;
	};
})(module);