(function(){
	var files = [
		'scripts/jqueryui/jquery-ui.min.js',

		'scripts/bootstrap/js/bootstrap.min.js',
		'scripts/underscore/underscore-min.js',

		'scripts/jqgrid/js/jquery.jqGrid.min.js',
		'scripts/jqgrid/js/i18n/grid.locale-cn.js',

		'scripts/select2/js/select2.min.js',
		'scripts/select2/js/i18n/select2_locale_zh-CN.js',
		'scripts/laydate/laydate.js',
		'scripts/multiselect/js/bootstrap-multiselect.min.js',
		// 'scripts/datetimepicker/js/bootstrap-datetimepicker.min.js',
		// 'scripts/datetimepicker/js/locales/bootstrap-datetimepicker.zh-CN.js',

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


/**
 * 信息详情(通用)
 */
function initGlobalDetailHtml(){
	var html = '';
	html += '<!-- 信息详情(通用) -->';
	html += '<div id="GlobalDetailPart" win-flag="1" style="display: none;">';
	html += '	<div class="col-md-12">';
	html += '	<div class="part-header">';
	html += '		<h4><i class="glyphicon glyphicon-cog"></i>查看行记录</h4>';
	html += '	</div>';
	html += '	<form id="GlobalDetailForm" class="form-detail" op-role="form">';
	html += '		<div class="part-body">';
	html += '			<table id="GlobalDetailForm-PG"></table>';
	html += '		</div>';
	html += '		';
	html += '		<div class="part-footer" style="margin-top: 6px;">';
	html += '			<button id="GlobalDetailForm-cancelBtn" type="button" class="btn btn-sm btn-default" data-dismiss="modal">关闭</button>';
	html += '		</div>';
	html += '	</form>';
	html += '	</div>';
	html += '</div>';
	$(html).appendTo('body');
}


/**
 * 简化文件上传初始化
 * @param target
 * @param ele_name
 * @param url
 */
function initCommonFileUpload(target, ele_name, url){
	ctrl.initFileUpload(target.find('input[name="file-'+ele_name+'"]'),{
		url: url,
		success_fun: function (e, data, obj){
			target.find('img[name="img-'+ele_name+'"]').attr({
				"src":data.result.file_url,"style":"height: 150px;width: 150px;"
			});
			target.find('input[name="'+ele_name+'"]').val(data.result.file_name);
		}
	});
	target.find('button[name="btn-'+ele_name+'"]').on('click',function(){
		target.find('input[name="file-'+ele_name+'"]').trigger('click');
	});
}

/**
 * 简化图集上传初始化
 * @param target
 * @param ele_name
 * @param url
 */
function initCommonAtlasUpload(target, ele_name, url){
	ctrl.initFileUpload(target.find('input[name="file-'+ele_name+'"]'),{
		url: url,
		success_fun: function (e, data, obj){
			target.find('div[name="img-div-'+ele_name+'"] > img[name="first-img"]').hide();
			var html = '<div class="img_item"><input name="'+ele_name+'" type="hidden" value="'+data.result.file_name+'" />'+
				'<img src="'+ data.result.file_url +'"/>'+
				'<span class="img_remove_tag" data-name="'+
				data.result.file_name+'" onClick="ctrl.removeFile(this)">&times;</span></div>';
			target.find('div[name="img-div-'+ele_name+'"]').append(html);
		}
	});
	target.find('button[name="btn-'+ele_name+'"]').on('click',function(){
		target.find('input[name="file-'+ele_name+'"]').trigger('click');
	});
}
/**
 * 简化图集数据加载
 * @param target
 * @param ele_name
 * @param pictureList
 */
function loadCommonAtlasUpload(target, ele_name, pictureList){
	target.find('div[name="img-div-'+ele_name+'"] > img[name="first-img"]').siblings().remove();
	if(pictureList != null && pictureList.length > 0){
		target.find('div[name="img-div-'+ele_name+'"] > img[name="first-img"]').hide();
		var html = '';
		$.each(pictureList, function (index,item) {
			html += '<div class="img_item"><input name="'+ele_name+'" type="hidden" value="'+item.picture_src+'" />'+
				'<img src="'+ item.picture_src_string +'"/>'+
				'<span class="img_remove_tag" data-name="'+
				item.picture_src+'" onClick="ctrl.removeFile(this)">&times;</span></div>';
		});
		target.find('div[name="img-div-'+ele_name+'"]').append(html);
	}else{
		target.find('div[name="img-div-'+ele_name+'"]').children('img').attr("src",config.getDefImgUrl()).show();
	}
}