/**
 * 与ajax请求相关(依赖app.config.js、app.common.js)
 */
var ajax = {};

(function(me){
	$__me = me;
	
	/**
	 * ajax加载数据
	 * @param options 属性
	 */
	me.getAjaxData = function(options){
		var _options = {
			url: null,// 请求地址
			data: {// 请求数据
				
			},
			fail_up: true,// 是否弹出错误信息
			is_loading: true,// 是否有加载动画
			success: null,// 成功回调函数,参数(object)
			error: null,// 失败回调函,参数(jqXHR, textStatus, errorThrown)
		};
		var ops = options ? $.extend(true, _options, options) : _options;
		if(!ops.url) return;
			
		$.ajax({
			url: config.getApiPath(ops.url),
			cache: false,
			type: 'GET',
			dataType: 'json',
			data: ops.data,
			beforeSend: function(){
				if(ops.is_loading) app.blockUI();
			},
			success: function(data) {
				if(ops.success) ops.success(data);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				if(ops.fail_up) app.ajaxError(jqXHR, textStatus, errorThrown);
				if(ops.error) ops.error(jqXHR, textStatus, errorThrown);
			},
			complete: function(XMLHttpRequest, status){
				if(status == 'timeout'){//超时,status还有success,error等值的情况
					app.show({content:'请求超时。请检查网络或联系相关人员',type:3});
				}
				if(ops.is_loading) app.unblockUI();
			}
		});
	};
	
	/**
	 * ajax新增数据
	 * @param options 属性
	 */
	me.postAjaxData = function(options){
		var _options = {
			url: null,// 请求地址
			data: {},
			fail_up: true,// 是否弹出错误信息
			is_loading: true,// 是否有加载动画
			success: null,// 成功回调函数,参数(object)
			error: null,// 失败回调函,参数(jqXHR, textStatus, errorThrown)
		};
		var ops = options ? $.extend(true, _options, options) : _options;
		if(!ops.url) return;
		
		$.ajax({
			url: config.getApiPath(ops.url),
			cache: false,
			type: 'POST',
			contentType: 'application/json;charset=utf-8',
			data: JSON.stringify(ops.data),
			beforeSend: function(){
				if(ops.is_loading) app.blockUI();
			},
			success: function(data) {
				if(ops.success) ops.success(data);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				if(ops.fail_up) app.ajaxError(jqXHR, textStatus, errorThrown);
				if(ops.error) ops.error(jqXHR, textStatus, errorThrown);
			},
			complete: function(XMLHttpRequest, status){
				if(status == 'timeout'){//超时,status还有success,error等值的情况
					app.show({content:'请求超时。请检查网络或联系相关人员',type:3});
				}
				if(ops.is_loading) app.unblockUI();
			}
		});
	};
	
	/**
	 * ajax修改数据
	 * @param options 属性
	 */
	me.putAjaxData = function(options){
		var _options = {
			url: null,// 请求地址
			data: {},
			fail_up: true,// 是否弹出错误信息
			is_loading: true,// 是否有加载动画
			success: null,// 成功回调函数,参数(object)
			error: null,// 失败回调函,参数(jqXHR, textStatus, errorThrown)
		};
		var ops = options ? $.extend(true, _options, options) : _options;
		if(!ops.url) return;
		
		$.ajax({
			url: config.getApiPath(ops.url),
			cache: false,
			type: 'PUT',
			contentType: 'application/json;charset=utf-8',
			data: JSON.stringify(ops.data),
			beforeSend: function(){
				if(ops.is_loading) app.blockUI();
			},
			success: function(data) {
				if(ops.success) ops.success(data);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				if(ops.fail_up) app.ajaxError(jqXHR, textStatus, errorThrown);
				if(ops.error) ops.error(jqXHR, textStatus, errorThrown);
			},
			complete: function(XMLHttpRequest, status){
				if(status == 'timeout'){//超时,status还有success,error等值的情况
					app.show({content:'请求超时。请检查网络或联系相关人员',type:3});;
				}
				if(ops.is_loading) app.unblockUI();
			}
		});
	};
	
	/**
	 * ajax删除数据
	 * @param options 属性
	 */
	me.deleteAjaxData = function(options){
		var _options = {
			url: null,// 请求地址
			fail_up: true,// 是否弹出错误信息
			is_loading: true,// 是否有加载动画
			success: null,// 成功回调函数,参数(object)
			error: null,// 失败回调函,参数(jqXHR, textStatus, errorThrown)
		};
		var ops = options ? $.extend(true, _options, options) : _options;
		if(!ops.url) return;
		
		$.ajax({
			url: config.getApiPath(ops.url),
			cache: false,
			type: 'DELETE',
			beforeSend: function(){
				if(ops.is_loading) app.blockUI();
			},
			success: function(data) {
				if(ops.success) ops.success(data);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				if(ops.fail_up) app.ajaxError(jqXHR, textStatus, errorThrown);
				if(ops.error) ops.error(jqXHR, textStatus, errorThrown);
			},
			complete: function(XMLHttpRequest, status){
				if(status == 'timeout'){//超时,status还有success,error等值的情况
					app.show({content:'请求超时。请检查网络或联系相关人员',type:3});;
				}
				if(ops.is_loading) app.unblockUI();
			}
		});
	};

})(ajax);