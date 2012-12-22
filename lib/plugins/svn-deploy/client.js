(function($) {
	var nameEl 		= $.sizzle("input[name='name']",$.E('svn_info'))[0];
	var passwdEl 	= $.sizzle("input[name='password']",$.E('svn_info'))[0];
	var svnEl		= $.sizzle("input[name='svn']",$.E('svn_info'))[0];
	var targetEl 	= $.sizzle("input[name='target']",$.E('svn_info'))[0];
	var treeBox 	= $.E('svn_tree_box');
	if(window.localStorage){
		nameEl.value = window.localStorage.getItem('name')|| '';
		passwdEl.value = window.localStorage.getItem('password')|| '';
	}
	
	$.addEvent($.E('svn_submit'), 'click', function() {
		$.core.evt.preventDefault();
		var data = $.core.util.htmlToJson($.E('svn_info'));
		if(isValid(data)){
			$.E('svn_info').submit();
			return false;
		}
	});
	
	//选择svn主干或分支地址
	var loaded = false;
	$.addEvent($.E('svn_ls'), 'click', function() {
		$.core.evt.preventDefault();
		if(treeBox.style.display === 'block'){
			return treeBox.style.display = 'none';
		}else if(loaded){
			var position = $.position($.E('svn_ls'));
			return treeBox.style.cssText = 'display:block;position:absolute;left:' + position.l + 'px;top:' + (position.t + 57) + 'px;';
		}
		var data = $.core.util.htmlToJson($.E('svn_info'));
		if(isValidAccount(data)){
			svnList('');
			return false;
		}
	});
	
	$.addEvent($.E('close'), 'click', function() {
		$.core.evt.preventDefault();
		$.E('svn_tree_box').style.display = 'none';
	});
	
	
	function isValid(json){
		if(!isValidAccount(json)){
			return false;
		}
		if($.core.str.trim(json.svn) === '' || (json.svn.indexOf('dev/trunk') === -1 && json.svn.indexOf('dev/branches') === -1)){
			alert('请输入合法的svn路径(主干或者分支地址) \n 如 https://svn1.intra.sina.com.cn/weibo/ria/t4/home/dev/trunk ');
			return false;
		}
		if($.core.str.trim(json.target) === ''){
			alert('请输入工程相对路径,如t4/home 或 t4/style 或 t4/webim 或 t4/appstyle/webim');
			return false;
		}

		return true;
	}
	
	function isValidAccount(json){
		if($.core.str.trim(json.name) === ''){
			alert('请输入svn 用户名!');
			return false;
		}
		if($.core.str.trim(json.password) === ''){
			alert('请输入svn 密码!');
			return false;
		}
		return true;
	}
	
	function svnList(project){
		$.core.io.ajax({
			url : '/list/' + project ,
			args : $.core.util.htmlToJson($.E('svn_info')),
			onComplete : function(json) {
				$.E('svn_tree_box').style.display = 'block';
				var box = $.E('sub_' + project) || $.E('svn_tree');
				if(json.error){
					return box.innerHTML = json.error;
				}
				if(window.localStorage){
					window.localStorage.setItem('name',nameEl.value);
					window.localStorage.setItem('password',passwdEl.value);
				}
				
				loaded = true;
				var html  = [],tmpl;
				json.data.sort(function(a,b){//拼音排序
	            	return a.toLowerCase().localeCompare(b.toLowerCase());
	            });
				$.foreach(json.data,function(name){
					if(name.replace(/\//g,'') !== 'online' &&  name.replace(/\//g,'') !== 'tags'){
						tmpl = '<li class="svn" >\
									<span id="#{id}">►</span><a href="javascript:void(0);">#{name}</a><ul id="sub_#{id}"></ul>\
								</li>';
								
						html.push($.core.util.templet(tmpl, {
							'id' 	: [json.pid,name].join('/').replace(/\/\//g,'/'),
							'name'	: name
						}));
					}
				});
				box.innerHTML = html.join('');
				
				$.foreach($.sizzle("span",box),function(item,i){
					$.addEvent(item,'click',function(e){
						$.core.evt.stopEvent(e);
						if(item.innerHTML === '►'){
							$.E('sub_' + item.id).style.display = '';
							svnList(item.id);
							item.innerHTML = '▼';
						}else{
							$.E('sub_' + item.id).style.display = 'none';
							item.innerHTML = '►';
						}
					});
				});
				$.foreach($.sizzle("a",box),function(item,i){
					$.addEvent(item,'click',function(e){
						svnEl.value = 'https://svn1.intra.sina.com.cn/weibo/ria' +  [json.pid,item.innerHTML].join('/').replace(/\/\//g,'/');
						treeBox.style.display = 'none';
						$.core.evt.stopEvent(e);
					});
				});
			}
		});
	}
	
})(STK);
