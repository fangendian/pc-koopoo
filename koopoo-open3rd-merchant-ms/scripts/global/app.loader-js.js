(function(){
	var files = [
		'scripts/jqueryui/jquery-ui.min.js',

		'scripts/bootstrap/js/bootstrap.min.js',
		'scripts/underscore/underscore-min.js',

		// 'scripts/jqgrid/js/jquery.jqGrid.min.js',
		// 'scripts/jqgrid/js/i18n/grid.locale-cn.js',

		// 'scripts/select2/js/select2.min.js',
		// 'scripts/select2/js/i18n/select2_locale_zh-CN.js',
		// 'scripts/laydate/laydate.js',
		'scripts/multiselect/js/bootstrap-multiselect.min.js',
		// 'scripts/datetimepicker/js/bootstrap-datetimepicker.min.js',

		'scripts/global/jquery.form.min.js',

		'./../js/env.config.js',
		'scripts/global/app.common.js',
		'scripts/global/app.control.js',
		'scripts/global/app.dict.js'
	];

	//参数2 是否阻止缓存
	$.include(files, false);

	//页面需要时通过jsfiles变量引用
	if(window.jsfiles && $.isArray(window.jsfiles)){
		$.include(window.jsfiles, false);
	}

}());

/**
 * 页面加载后
 */
function initAfterPageLoaded(){
	$('input[accept="image/*"]').attr('accept','image/gif,image/jpg,image/jpeg,image/png,image/bmp,image/webp');
	$('input[accept="video/*"]').attr('accept','video/3gpp,video/mp4,video/mpeg,video/quicktime,video/flv,video/m4v,video/wmv,video/x-msvideo');
	//所有页面搜索框内，只有在文本框内回车就默认调用查询方法
	var parent_signify = 'form[op-role="form"]';
	$(parent_signify).find('input').on('keydown',function(e) {
		var $self = $(this);
		app.checkEnterKey(function(){
			var $form = app.getParent($self, parent_signify);
			$form.find('*[op-btn="default"]').click();
		}, e);
	});
	ctrl.initSelect2ForAttribute();
	try {
		//由于页面使用频率不高,可能会考虑需要时添加
		ctrl.initMultiselect($('select[op-role="ms"]'));
	} catch (e) {
	}
}