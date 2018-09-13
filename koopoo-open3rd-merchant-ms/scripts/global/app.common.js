/**
 * 全局配置信息
 */
var config = {};

(function(me){
	var $__me = me;
	var $temp = {
//		search_panel: {
//			height: null
//		}
	};

	me.lsk_shop_info = 'WM_C_I'; //当前本地商户信息
	me.lsk_shop_id = 'WM_C_SID'; //当前本地商户ID的键
	me.lsk_user_info = 'WM_U_I'; //

	/**
	 * 项目根目录
	 */
	me.base_path = window.__basePath;

    /**
     * 接口根路径
     */
    me.api_path_top  = SASS_PATH.api_path_top || 'https://open3rd.koopoo.top/';
    me.api_path_heka = SASS_PATH.api_path_heka || '/koopoo-xs-saas/';//heka路径
    me.api_path      = SASS_PATH.api_path || '/koopoo-open3rd/';//第三方路径
    me.api_path_full =  me.api_path_top + me.api_path_heka;//heka development

	/**
	 * echarts主题
	 */
	me.echarts_theme = 'macarons';

	/**
	 * 加载提示
	 */
	me.wait = '#global-wait';
	me.wait_info = '#global-wait-info';

	/**
	 * 显示记录的modal
	 */
	me.global_part = '#GlobalDetailPart';
	me.global_form = '#GlobalDetailForm';

	/**
	 * 上传文件时的默认图片
	 */
	me.def_img_url = '/images/upload-default-img.png';
	/**
	 * 获取上传文件时的默认图片
	 */
	me.getDefImgUrl = function(){
		return $__me.getFullPath($__me.def_img_url);
	};

	/**
	 * 页面临时变量
	 */
	me.temp = $temp;

	/**
	 * select2
	 */
	me.select2 = {
		placeholder: '--请选择--',
		default_option: '<option value="">&nbsp;</option>',
		state_one : 'state=1',//option选项颜色标识
		split_text : ','
	};

	/**
	 * multiselect
	 */
	me.multiselect = {
		state_one : 'state=1',//option选项颜色标识
		split_text : ','
	};

	/**
	 * 获取全路径
	 * @param path 根目录下的相对路径
	 */
	me.getFullPath = function(path){
		var url = '';
		if(path){
			if(path.match(/http:\/\//)){
				url = path
			}else{
				url = $__me.base_path + path;
			}
		}else{
			url = $__me.base_path
		}
		return url;
	};

    me.getHekaFullPath = function(){
		return $__me.api_path_full;
    };

	/**
	 * 获取接口全路径
	 * @param path 根目录下的相对路径
	 */
	me.getApiPath = function(path){
		var url = '';
		if(path){
			if(path.match(/http:\/\//)){
				url = path
			}else{
				url = $__me.api_path + path;
			}
		}else{
			url = $__me.api_path
		}
		return url;
	};

	/**
	 * 重置信息
	 */
	me.reload = function(){
		$__me.temp = $temp;
	};

	me.isFunction = function (target) {
        return typeof target === 'function';
    }

})(config);


/**
 * 基于jquery的扩展辅助(依赖app.config.js)
 */
var app = {};

(function(me){
	var $__me = me;

    me.isFunction = function (target) {
        return typeof target === 'function';
    }

	/**
	 * 确认提示框
	 * 
	 * @param options 属性
	 * @returns
	 */
	me.confirm = function(options){
		var _options = {
			title: '系统提示',// 标题
			content: null,// 内容
			okCallback: null,// 确认回调函数
			cancelCallback: null,// 取消回调函数
			otherButtons: ['取消', '确定'],
			otherButtonStyles: ['btn-default', 'btn-primary']
		};
		var ops = options ? $.extend(_options, options) : _options;
		$.teninedialog({
			title: ops.title,
			content: ops.content,//
			showCloseButton: false,
			otherButtons: ops.otherButtons,
			otherButtonStyles: ops.otherButtonStyles,
			dialogHidden:function(){
	        	var mask = $('div[class="modal-backdrop fade in"]');
	        	if(!mask || mask.length < 1){
	        	}else{
	        		$('body').addClass('modal-open').css('padding-right', '17px');
	        	}
	        },
			bootstrapModalOption: {keyboard: true},
			clickButton: function(sender, modal, index){
				$(this).closeDialog(modal);
				if(index == 1){
					if(ops.okCallback) ops.okCallback();
					if(me.isFunction(ops.callback)) ops.callback();
				}else{
					if(ops.cancelCallback) ops.cancelCallback();
				}
                if(ops.complete) ops.complete();
            }
			
		});
	};
	
	/**
	 * 提示框
	 * 
	 * @param options 属性
	 * @returns
	 */
	me.alert = function(options){
		var _options = {
			title: '系统提示',// 标题
			content: null,// 内容
			otherButtons: ['确定'],
			otherButtonStyles: ['btn-primary'],
			showCloseButton: false
		};
		var ops = null;
		if(typeof options == ('string'||'number')){
			_options.content = options;
			ops = _options;
		}else{
			ops = options ? $.extend(_options, options) : _options;
		}
		$.teninedialog({
	        title: ops.title,
	        content: ops.content,
			otherButtons: ops.otherButtons,
			otherButtonStyles: ops.otherButtonStyles,
	        showCloseButton: ops.showCloseButton,
	        dialogHidden:function(){
	        	var mask = $('div[class="modal-backdrop fade in"]');
	        	if(!mask || mask.length < 1){
	        	}else{
	        		$('body').addClass('modal-open').css('padding-right', '10px');
	        	}
	        },
	        bootstrapModalOption: {keyboard: true},
			clickButton: function(sender, modal, index){
				$(this).closeDialog(modal);
				if(me.isFunction(ops.callback)) ops.callback();
			}
	    });
	};

	/**
	 * 提示框
	 *
	 * @param options 属性
	 * @returns
	 */
	me.show = function(options){
		var _options = {
			title: '系统提示',// 标题
			content: null,// 内容
			time: '2800',// 多长时间关闭
			type: 2// 类型 1:成功消息 2:普通消息 3:警告信息 4:错误信息
		};
		var ops = null;
		if(typeof options == ('string'||'number')){
			_options.content = options;
			ops = _options;
		}else{
			ops = options ? $.extend(_options, options) : _options;
		}
		switch (ops.type) {
			case 1:
				ops['class_name'] = 'gritter-success';
				ops['icon_class'] = 'fa fa-check-circle'; break;
			case 2:
				ops['class_name'] = 'gritter-info';
				ops['icon_class'] = 'fa fa-info-circle'; break;
			case 3:
				ops['class_name'] = 'gritter-warning';
				ops['icon_class'] = 'fa fa-warning'; break;
			case 4:
				ops['class_name'] = 'gritter-error';
				ops['icon_class'] = 'fa fa-times-circle'; break;
			default://默认为2
				ops['class_name'] = 'gritter-light';
				ops['icon_class'] = 'fa fa-info-circle'; break;
		}
		if(!$.gritter.options._mark_flag){// 第一次初始化gritter
			$.extend($.gritter.options, {
				_mark_flag: true,//初始化标识
				position: 'center-center', // bottom-left, bottom-right, top-left, top-right, center-center
				class_name: '', // could be set to 'gritter-light' to use white notifications
				icon_class: '',
				fade_in_speed: 300, // how fast notifications fade in
				fade_out_speed: 300, // how fast the notices fade out
				time: 3000 // hang on the screen for...
			});
		}
		$.gritter.add({
			title: ops.title,
			text: ops.content,
			icon_class: ops.icon_class,
			sticky: false,
			time: ops.time,
			class_name: ops.class_name//gritter-error  gritter-error gritter-light
		});
	};


	var loadingCount = 0;
	/**
	 * 数据加载提示
	 */
	me.blockUI = function(str){
		if(!loadingCount) {
			var wait = $__me.getJqueryObject(config.wait);
			wait.fadeIn(200).next().fadeOut(200);
			wait.children('span').html(str || '处理中，请稍后');
		}
		++loadingCount;
	};

	/**
	 * 关闭加载提示
	 */
	me.unblockUI = function(mustHide){
		if(mustHide) loadingCount = 0;
		if(--loadingCount < 1) {
			var wait = $__me.getJqueryObject(config.wait);
			wait.fadeOut(200).next().fadeOut(200);
			loadingCount = 0;
		}
	};

	/**
	 * 字符串转日期
	 * 
	 * @param date_str 日期字符串
	 * @returns
	 */
	me.getStrToDate = function(date_str){
		if(!date_str) return null;
		return new Date(date_str.replace(/-/g,"/"));
	};

	/**
	 * 时间戳转字符串 如：2015-10-10
	 * 
	 * @param ms 时间戳(毫秒)
	 * @param format format格式  yyyy-MM-dd HH:mm:ss
	 * @returns
	 */
	me.getLongToStrFormat = function(ms, format){    
		if(!ms) return '';
		return new Date(parseInt(ms)).format(format);
	};

	/**
	 * 时间戳转字符串 如：2015-10-10 10:10:10
	 * 
	 * @param ms 时间戳(毫秒)
	 * @returns
	 */
	me.getLongToStrYMDHMS = function(ms){    
		if(!ms) return '';
	    return new Date(parseInt(ms)).format('yyyy-MM-dd HH:mm:ss');
	};

	/**
	 * 时间戳转字符串 如：2015-10-10 10:10
	 * 
	 * @param ms 时间戳(毫秒)
	 * @returns
	 */
	me.getLongToStrYMDHM = function(ms){
		if(!ms) return '';
		return new Date(parseInt(ms)).format('yyyy-MM-dd HH:mm');
	};

	/**
	 * 时间戳转字符串 如：2015-10-10 10
	 * 
	 * @param ms 时间戳(毫秒)
	 * @returns
	 */
	me.getLongToStrYMDH = function(ms){    
		if(!ms) return '';
		return new Date(parseInt(ms)).format('yyyy-MM-dd HH');
	};

	/**
	 * 时间戳转字符串 如：2015-10-10
	 * 
	 * @param ms 时间戳(毫秒)
	 * @returns
	 */
	me.getLongToStrYMD = function(ms){    
		if(!ms) return '';
		return new Date(parseInt(ms)).format('yyyy-MM-dd');
	};

	/**
	 * 判断是否是空
	 */
	me.isEmpty = function(value){
        return (value === null || value === '' || typeof value === 'undefined');
	};
	
	/**
	 * 判断是否是非空字符串
	 * 
	 * @param str 字符串
	 */
	me.isNotEmpty = function(str){
		if(!str || $.trim(str).length < 1){
			return false;
		}
		return true;
	};
	
	/**
	 * 判断简单数据类型简单类型(字符串、数字、浮点类型等)数组里是否存在某个元素
	 * 
	 * @param arr 字符串数组
	 * @param str 字符串
	 */
	me.strContains = function(arr, str){
		var flg = false;
		for ( var i in arr) {
			if(str == arr[i]){
				flg = true;
				break;
			}
		}
		return flg;
	};
	
	/**
	 * 判断简单数据类型简单类型(字符串、数字、浮点类型等)数组里是否存在某个元素,有就删除
	 * 
	 * @param arr 字符串数组
	 * @param str 字符串
	 */
	me.strRemove = function(arr, str){
		var flg = false;
		for ( var i in arr) {
			if(str == arr[i]){
				arr.splice(i, 1);
				flg = true;
			}
		}
		return flg;
	};

	
	/**
	 * 对象为null,则返回value_if_null; 否则返回其本身
	 * 
	 * @param target        Integer类型
     * @param value_if_null 为null时的返回该值
	 */
	me.ifNull = function(target, value_if_null){
		if(value_if_null == null){
			value_if_null = '';
		}
		return target == null ? value_if_null : target;
	};
	
	/**
	 * 获取字节数
	 * 
	 * @param str 字符串
	 */
	me.getBytes = function (str) {
		var rst, regex,
		input = str,
		count = 0;
		if (rst = input) {
			rst = input.length;
			for (regex = /[\u4e00-\u9fa5]/; rst--; ) {
				count += regex.test(input.charAt(rst)) ? 2 : 1;
			}
		}
		return count;
	};
	
	/**
	 * 获取对象的属性值(对象)或对象集合中元素(对象)
	 * 
	 * @param objMap 对象或者集合
	 * @param key 属性值(对象)对应的属性名或元素(对象)对应的键(下标)
	 * @returns 
	 */
	me.getObject = function(objMap, key){
		return objMap[key] ? objMap[key] : {};
	};
	
	/**
	 * val的长度小于length则左边填充leftVal,直至长度为length
	 * 
	 * @param val 被填充的字符串
	 * @param leftVal 即将要填充的新字符串
	 * @param length 目标长度
	 */
	me.leftPaddingVal = function(val,leftVal,length){
		while(String(val).length < length){
			val = leftVal + val;
		}
		return val;
	};
	
	/**
	 * 填充占位符获取完整信息
	 * 
	 * @param info 带占位符的信息
	 * @param params 站位填充参数
	 */
	me.getFullInfo = function(info, params){
		if(!params){
			return info;
		}
		$.each(params, function (key, value) {
			info = info.replace('{'+key+'}', value);
		});
		return info;
	};
	
	/**
	 * 请求同步导出数据
	 * 
	 * @param url 请求地址
	 * @param ajaxData 请求数据
	 */
	me.openExpo = function(url, ajaxData){
		url = config.getApiPath(url)
		if(!ajaxData || Object.getOwnPropertyNames(ajaxData).length < 1){
			window.open(url);
		}else{
			url += (url.indexOf('?') > -1 ? '&' : '?');
			$.each(ajaxData, function (key, value) {
				if(value == null) return;
				url += key + '=' + value + '&';
			});
			window.open(url);
		}
	};
	
	/**
	 * 序列化表单属性
	 * 
	 * @param formId 表单ID
	 * @param isEncode 是否编码处理
	 */
	me.serializeForm = function(formId, isEncode) {
		var obj = {};
		if(formId.indexOf('#') < 0){
			formId = '#' + formId;
		}
		var arr = $(formId).serializeArray();
		$.each(arr, function(index) {
			if(isEncode){
				obj[this['name']] = encodeURIComponent(this['value']);
			}else{
				obj[this['name']] = this['value'];
			}
		});
		return obj;
	};

	/**
	 * 根据特征,搜寻父级对象
	 * 
	 * @param children 子元素的ID或jquery对象
	 * @param parentSignify 父元素的特征
	 */
	me.getParent = function(children, parentSignify){
		var $obj = $__me.getJqueryObject(children);
		var $form = $obj.parent(parentSignify);
		for (var i = 0; i < 6; i++) {
			if($form.length > 0){
				break;
			}
			$obj = $obj.parent();
			$form = $obj.parent(parentSignify);
		}
		if(!$form || $form.length < 1){
			return null;
		}else{
			return $form;
		}
	};
	
	/**
	 * 判断回车键,回调相关函数
	 * 
	 * @param callback 回调函数
	 * @param e 事件源
	 */
	me.checkEnterKey = function(callback, e){
		e = e ? e : (arguments.callee.caller.arguments[0] || window.event);
		var keyCode = e.which;
	    if(keyCode == '13'){
	   		callback();
	   		try {
	    		if(event && event.preventDefault){
	    			window.event.returnValue = false;
	    		}
			} catch (e) {
				//非IE浏览器
				try {
					if(e.preventDefault){
						e.preventDefault();//for firefox
					}
				} catch (e) {
					// TODO: handle exception
				}
			}
		}
	};
	
	/**
	 * 在父元素(form)的子元素中,获取元素属性[form-flag="1"]的数据MAP(key->value),
	 * key为元素name属性值,value为元素的value属性值
	 * 
	 * @param parentForm 父元素的ID或jquery对象
	 * 					'SearchForm' 或 '#SearchForm' 或 $('#SearchForm')
	 * @param formFlag 标识值 默认为1
	 * @returns
	 */
	me.getFormData = function(parentForm, formFlag){
		var data = {};
		if(!parentForm) return data;
		
		var reg = formFlag?'*[form-flag="'+formFlag+'"]':'*[form-flag="1"]';
		var $_obj = $__me.getJqueryObject(parentForm);
		$_obj.find(reg).each(function(index){
			data[$(this).attr('name')] = $(this).val();
		});
		return data;
	};
	
	/**
	 * 在父元素(form)的子元素中,当子name属性值与objMap中的key名相同,
	 * 则将元素的value属性值设置成objMap中value值
	 * 
	 * @param parentForm 父元素的ID或jquery对象
	 * 					'SearchForm' 或 '#SearchForm' 或 $('#SearchForm')
	 * @param objMap 键值对对象
	 * @returns
	 */
	me.setFormData = function(parentForm, objMap){
		if(!parentForm) return ;
		
		var $_obj = $__me.getJqueryObject(parentForm);
		if(Object.getOwnPropertyNames(objMap).length > 0){
			$.each(objMap, function (key, value) {
				var $element = $_obj.find('*[name="'+key+'"]'),
					type = $element.attr('type');
				if(type == 'checkbox' || type == 'radio') {
					if(value) $element[0].checked = true;
				} else {
					$element.val(value != null ? ''+value : '');
					if($element.is('select')) $element.trigger('change');
				}
			});
		}
	};
	
	/**
	 * AJAX请求错误统一回调函数
	 * 
	 * @param jqXHR jqXHR对象（包含四个属性） 
	 * 		readyState :当前状态,0-未初始化，1-正在载入，2-已经载入，3-数据进行交互，4-完成。
	 *		status  ：返回的HTTP状态码，比如常见的404,500等错误代码。
	 *		statusText ：对应状态码的错误信息，比如404错误信息是not found,500是Internal Server Error。
	 *		responseText ：服务器响应返回的文本信息
	 * @param textStatus 状态码
	 * @param errorThrown 服务器抛出返回的错误信息
	 */
	me.ajaxError = function(jqXHR, textStatus, errorThrown) {
		try {
			var error = $.parseJSON(jqXHR.responseText);
			var errorText;
			switch (error.error) {
				case '0':
					errorText = '网络连接异常';
					break;
				case '504':
					errorText = '网络连接超时';
					break;
				case '2000':
					errorText = '用户不存在';
					break;
				case '2001':
					errorText = '用户名或密码错误';
					break;
				case '999':
				case '2005':
					top.app.alert({
						content: '<div class="pt-5 pb-15">登录超时，请重新登录。是否跳转登录页？</div>',
						otherButtons: ['重新登录'],
						otherButtonStyles: ['btn-danger'],
						callback: function(){
							sessionStorage.removeItem(config.lsk_user_info);
							sessionStorage.removeItem(config.lsk_shop_info);
							sessionStorage.removeItem(config.lsk_shop_id);
							top.location.href = config.getFullPath('page/login.html');
						}
					});
					return;
				default:
					var description = error.error_description;
					if(/^Could\s?not\s?read\s?JSON/.test(errorText)) {
						errorText = '数据解析错误！';
					} else if(!/^服务器内部错误/.test(description) && description.length < 18) {
						errorText = description;
					} else {
						errorText = '请求失败！';
					}
					break;
			}
		} catch (e) {//非自定义错误信息
			errorText = '数据加载失败！';
		}
		$__me.show({content: errorText, type:4});
	};

	/**
	 * 获取Jquery对象
	 * 
	 * @param element 元素的ID或jquery对象
	 * 					'SearchForm' 或 '#SearchForm' 或 $('#SearchForm')
	 * @param objMap 键值对对象
	 * @returns
	 */
	me.getJqueryObject = function(element){
		var $_obj = null;
		if(!element){
			return ;
		}else if(element instanceof jQuery){ 
			$_obj = element;
		}else if(typeof element === 'object'){ 
			$_obj = $(element);
		}else{
			$_obj = element.indexOf('#') > -1 ? $(element) : $('#'+element);
		}
		return $_obj;
	};
	
	/**
	 * 获取某URL中的所有参数
	 * 
	 * @param url URL地址(可为空,默认为当前页地址)
	 * @returns 键对值的形式 { key : "" }
	 */
	me.getUrlParamsMap = function(url){
		var params = (url ? url : location.search).replace(/^.*\?/, '');
		var object = {};
		if(params) {
			params = params.split('&');
			for(var i = 0, item; i < params.length; i++){
				item = params[i].split('=');
				object[item[0]] = item[1];
			}
		}
		return object;
	};
	
	/**
	 * 本地化检索
	 * 
	 * @param list 被检索的数据列表
	 * @param options属性：
	 * 			where 等于精确匹配数据
	 * 			like like模糊查询
	 * 例如:
	 * app.localSearch([{id:1,name:"1111"},{id:2,name:"2222"},{id:null,name:"3333"}],{where:{id:null},ignore_empty:true});
	 * app.localSearch([{id:1,name:"1111"},{id:2,name:"2222"},{id:null,name:"3333"}],{where:{id:null},ignore_empty:false});
	 */
	me.localSearch = function(list, options){
		if(!list || list.length < 1) return [];
		var _options = {
			where: {},// 精确查询
			like: {},// 模糊查询
			ignore_empty: true// 忽略值为null或''值的查询条件
		};
		var ops = options ? $.extend(_options, options) : _options;

		var where_length = Object.getOwnPropertyNames(ops.where).length;
		var like_length = Object.getOwnPropertyNames(ops.like).length;
		if(where_length < 1 && like_length < 1){
			return list;
		}
		
		var result = _.filter(list, function(item){
			var flg = true;
			//where查询结果 
			if(where_length > 0){
				$.each(ops.where, function (key, value) {
					if(!flg) return ;
					if(ops.ignore_empty && (value == null || value == '')) return ;
					
					if(item[key] == value){
						flg = true;
					}else{
						flg = false;
					}
				});
			}
			//like查询结果 
			if(like_length > 0){
				$.each(ops.like, function (key, value) {
					if(!flg) return ;
					if(ops.ignore_empty && (value == null || value == '')) return ;
					var reg = eval('/'+value+'/');
					if(item[key] == value){
						return true;
					}else if(item[key] != null && item[key].match(reg)){
						return true;
					}else{
						flg = false;
					}
				});
			}
			return flg;
		});
		return result;
	};

	me.isPhone = function (mobile_no){
		var reg = /^1[3-9]\d{9}$/;
		if(reg.test(mobile_no)){
			return true;
		}
		return false;
	};
	me.isEmail = function (email){
		var reg = /\w+[@]{1}\w+[.]\w+/;
		if(reg.test(email)){
			return true;
		}
		return false;
	};
	me.isPostCode = function (post_code){
		var reg = /^[0-9]{6}$/;
		if(reg.test(post_code)){
			return true;
		}
		return false;
	};
	me.isCardNo = function (card){
		// 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
		var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
		if(reg.test(card)){
			return true;
		}
		return false;
	};
	me.isQQ = function (qq){
		var reg = /^\d{5,10}$/;
		if(reg.test(qq)){
			return true;
		}
		return false;
	};
	me.isUsername = function (username){
		var reg= /^[a-zA-Z0-9_@.]{5,16}$/;
		if(reg.test(username)){
			return true;
		}
		return false;
	};

	me.isFunction = function (target) {
		return typeof target === 'function' ? true : (false);
    }

})(app);


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
			data: {},
			fail_up: true,// 是否弹出错误信息
			is_loading: true,// 是否有加载动画
			success: null,// 成功回调函数,参数(object)
			error: null// 失败回调函,参数(jqXHR, textStatus, errorThrown)
		};
		var ops = options ? $.extend(true, _options, options) : _options;
		if(!ops.url) return;

		$.ajax({
			url: config.getApiPath(ops.url),
			cache: !!ops.cache,
			type: 'GET',
			dataType: 'json',
			data: ops.data,
			beforeSend: function(){
				if(ops.is_loading) top.app.blockUI();
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
				if(ops.is_loading) top.app.unblockUI();
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
			url: ops.url.indexOf('http')!=-1?ops.url: config.getApiPath(ops.url),
			cache: !!ops.cache,
			type: 'POST',
			headers: ops.headers||{},
			contentType: 'application/json;charset=utf-8',
            data: JSON.stringify(ops.data),
			beforeSend: function(){
				if(ops.is_loading) top.app.blockUI();
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
				if(ops.is_loading) top.app.unblockUI();
				if(ops.complete) ops.complete();
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
			cache: !!ops.cache,
			type: 'PUT',
			contentType: 'application/json;charset=utf-8',
			data: JSON.stringify(ops.data),
			beforeSend: function(){
				if(ops.is_loading) top.app.blockUI();
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
				if(ops.is_loading) top.app.unblockUI();
				if(ops.complete) ops.complete();
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
			cache: !!ops.cache,
			type: 'DELETE',
			beforeSend: function(){
				if(ops.is_loading) top.app.blockUI();
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
				if(ops.is_loading) top.app.unblockUI();
			}
		});
	};

})(ajax);
