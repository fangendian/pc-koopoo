/**
 * 全局配置信息
 */
var config = {};

(function(me){
	var $__me = me;
	var $temp = {
//		search_panel: {
//			height: null
//		},
		/**
		 * 缓存grid的数据 
		 */
		grid: {
			data: {},//元素id->result data
			row_css: {},//元素id->行ID->行样式
			col_map: {}//元素id->列name->列title
		}
	};

	me.lsk_shop_info = 'WM_C_I'; //当前本地商户信息
	me.lsk_shop_id = 'WM_C_SID'; //当前本地商户ID的键
	me.lsk_user_info = 'WM_U_I'; //

	/**
	 * 项目根目录
	 */
	me.base_path = '/koopoo-open3rd-ms/';
	
	/**
	 * 接口根路径
	 */
	me.api_path = SASS_PATH.api_path || '/koopoo-open3rd/';//development
//	me.api_path = 'http://192.168.1.113/koopoo-open3rd/';//development

	/**
	 * echarts主题
	 */	
	me.echarts_theme = 'macarons',
	
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
	
})(config);
