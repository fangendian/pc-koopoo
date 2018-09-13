var urls = {
	listCustom: 'ms/systemplates/list/',
	addCustom: 'ms/systemplates/',
	getCustom: 'ms/systemplates/{template_id}/',
	editCustom: 'ms/systemplates/{template_id}/',
	uploadFile: 'ms/files/upload/',
	uploadBatchFile: 'ms/files/upload/batch'
};
var mainPartId = '#MainPart';
var searchCustomFormId='#SearchCustomForm',gridCustom,
gridCustomTableId='#GridCustomTable',gridCustomPagerId='#GridCustomPager',
addCustomPartId='#AddCustomPart',addCustomFormId='#AddCustomForm',
editCustomPartId='#EditCustomPart',editCustomFormId='#EditCustomForm';

var IsDeletedList=[];

$(function($) {
	//加载后通用
	initAfterPageLoaded();
	//初始化控件
	initControl();
	//初始化grid
	initCustomGrid();
	//初始化事件
	initCustomEvent();
});	

/**
 * 初始事件
 */
function initCustomEvent(){
	//查询按钮点击触发
	$(searchCustomFormId+'-queryBtn').bind('click',function(){
		searchCustomFun();
	});
	$(searchCustomFormId+'-resetBtn').bind('click',function(){
		resetCustomFun();
	});
	
	//新增
	$(addCustomFormId+'-saveBtn').bind('click',function(){
		addCustomInfo();
	});
	$(addCustomFormId+'-cancelBtn').bind('click',function(){
		app.toggleView(mainPartId,{isTriggerGrid: true});
	});
	
	//编辑
	$(editCustomFormId+'-saveBtn').bind('click',function(){
		editCustomInfo();
	});
	$(editCustomFormId+'-cancelBtn').bind('click',function(){
		app.toggleView(mainPartId,{isTriggerGrid: true});
	});

	//详情(通用)
	$(config.global_form+'-cancelBtn').bind('click',function(){
		app.toggleView(mainPartId,{isTriggerGrid: true});
	});
}

/**
 * 初始控件
 */
function initControl(){
	var searchTarget = $(searchCustomFormId);
	var addTarget = $(addCustomFormId);
	var editTarget = $(editCustomFormId);
	//是否删除
	dict.getCommonYesOrNoForData_B(null, IsDeletedList);
	ctrl.setSelect2Option([
        searchTarget.find('select[name="is_deleted"]'),
        addTarget.find('select[name="is_deleted"]'),
        editTarget.find('select[name="is_deleted"]')
    ], IsDeletedList);
	// 创建时间
	ctrl.initLayDate(searchCustomFormId+'-create_time_begin',{
		isclear: true
	},searchCustomFormId+'-create_time_end',{
		isclear: true
	});
	// 修改时间
	ctrl.initLayDate(searchCustomFormId+'-modify_time_begin',{
		isclear: true
	},searchCustomFormId+'-modify_time_end',{
		isclear: true
	});

	initCustomUploadControl(addTarget,"icon_src");
	initCustomUploadControl(addTarget,"cover_src");
	initCustomUploadControl(editTarget,"icon_src");
	initCustomUploadControl(editTarget,"cover_src");

	//上传图集
	ctrl.initFileUpload(addTarget.find('input[name="file-package_atlas"]'), {
		url: urls.uploadBatchFile,
		maxFileSize:2 * 1024 * 1024,
		success_fun: function (e, data, obj) {
			var target = $(addTarget);
			target.find('div[name="img-div-package_atlas"] > img[name="first-img"]').hide();
			var html = '';
			$.each(data.result, function (key, value) {
				html += '<div class="img_item"><img src="'+ value.file_url +'"/>' +
					'<span class="img_remove_tag" data-name="'+value.file_name+'" onClick="removeImg(this)">&times;</span></div>';
			});
			target.find('div[name="img-div-package_atlas"]').append(html);
			console.log(target.find('div[name="img-div-package_atlas"]').html())
		}
	});
	addTarget.find('img[name="first-img"]').on('click', function(){
		addTarget.find('input[name="file-package_atlas"]').trigger('click');
	});

	//上传图集(编辑)
	ctrl.initFileUpload(editTarget.find('input[name="file-package_atlas"]'), {
		url: urls.uploadBatchFile,
		maxFileSize:2 * 1024 * 1024,
		success_fun: function (e, data, obj) {
            console.log(1);
            console.log(data);
            console.log(data.result);
            var target = $(editTarget);
            target.find('div[name="img-div-package_atlas"] > img[name="first-img"]').hide();
            var html = '';
			$.each(data.result, function (key, value) {
				html += '<div class="img_item"><img src="'+ value.file_url +'"/>' +
					'<span class="img_remove_tag" data-name="'+value.file_name+'" onClick="removeImg(this)">&times;</span></div>';
			});
			target.find('div[name="img-div-package_atlas"]').append(html);
			console.log(target.find('div[name="img-div-package_atlas"]').html())
		}
	});
	editTarget.find('img[name="first-img"]').on('click', function(){
		editTarget.find('input[name="file-package_atlas"]').trigger('click');
	});
}

/**
 * 初始化上传
 */
function initCustomUploadControl(target, fileUploadName){
	//封面文件上传
	ctrl.initFileUpload(target.find('input[name="file-'+fileUploadName+'"]'),{
		url: urls.uploadFile,
		maxFileSize:2 * 1024 * 1024,
		success_fun: function (e, data, obj){
			target.find('img[name="img-'+fileUploadName+'"]').attr({
				"src":data.result.file_url,"style":"height: 150px;width: 150px;"
			});
			target.find('input[name="'+fileUploadName+'"]').val(data.result.file_name);
		}
	});
	target.find('img[name="img-'+fileUploadName+'"]').on('click', function(){
		target.find('input[name="file-'+fileUploadName+'"]').trigger('click');
	});
}

/**
 * 初始化grid
 */
function initCustomGrid(){
	var options = {
		url: urls.listCustom,
		colModel:[//每一列的具体信息，index是索引名，当需要排序时，会传这个参数给后端
			{title:'ID',name:'template_id',index:'t.template_id',width:120,sortable:true},
			{title:'名称',name:'template_name',index:'t.template_name',width:120,sortable:false},
			// {title:'图标',name:'icon_src',index:'t.icon_src',width:80,sortable:false,
			// 	formatter:function(v, opt, r){
			// 		if(!r.icon_src_string) return '';
			// 		return '<a target="_blank" href="'+r.icon_src_string+
		   	// 		'"><img src="'+r.icon_src_string+'" alt="查看原图" style="height:20px;width:20px;"/></a>';
			// 	}
			// },
			{title:'封面',name:'cover_src',index:'t.cover_src',width:80,sortable:false,
				formatter:function(v, opt, r){
					if(!r.cover_src_string) return '';
					return '<a target="_blank" href="'+r.cover_src_string+
		   			'"><img src="'+r.cover_src_string+'" alt="查看原图" style="height:20px;width:20px;"/></a>';
				}
			},
			{title:'描述',name:'description',index:'t.description',width:120,sortable:false},
			{title:'提交到微信开发平台代码库中的代码模版ID',name:'wx_template_id',index:'t.wx_template_id',width:120,sortable:false},
			{title:'第三方自定义的配置',name:'wx_ext_json',index:'t.wx_ext_json',width:120,sortable:false},
			{title:'代码版本号，开发者可自定义',name:'wx_user_version',index:'t.wx_user_version',width:120,sortable:false},
			{title:'代码描述，开发者可自定义',name:'wx_user_desc',index:'t.wx_user_desc',width:120,sortable:false},
			{title:'是否删除',name:'is_deleted',index:'t.is_deleted',width:120,sortable:false,
	        	formatter:function(v, opt, r){
	        		return dict.getCommonYesOrNoForHtml_BR(v);
	        	}
	        },
			{title:'创建时间',name:'create_time',index:'t.create_time',width:150,sortable:false,
				formatter:function(v, opt, r){
					return app.getLongToStrYMDHMS(r.create_time_long);
				}
			},
			{title:'修改时间',name:'modify_time',index:'t.modify_time',width:150,sortable:false,
				formatter:function(v, opt, r){
					return app.getLongToStrYMDHMS(r.modify_time_long);
				}
			}
        ],
        sortname: 't.template_id',
        sortorder: 'desc',
//		multiselect: true,
// 		caption: '模板',
		nav_button_arr: [
			{
				caption: '新增',
				title: '新增',
				buttonicon: 'fa fa-plus-circle purple',
				onClickButton: function(){
					addCustomInfoShow();
				},
				position: 'last'//first last
		    },
			{
				caption: '编辑',
				title: '编辑',
				buttonicon: 'fa fa-pencil blue',
				onClickButton: function(){
					var rw = ctrl.getSingleSelectedRowData(gridCustomTableId);
					if(!rw) return false;
					editCustomInfoShow(rw);
				},
				position: 'last'//first last
			}
		]
	};
	
	//初始化gird
	gridCustom = ctrl.initGrid(gridCustomTableId, gridCustomPagerId, options);
}

/**
 * 查询
 */
function searchCustomFun(){
	var submitObj = app.getFormData(searchCustomFormId);
	gridCustom.jqGrid('setGridParam',{
		postData: submitObj,
		page: 1
	}).trigger('reloadGrid'); //重新载入
}

/**
 * 重置
 */
function resetCustomFun(){
	ctrl.resetForm(searchCustomFormId);//清空form内容
}

/**
 * 刷新数据
 */
function refreshCustomGrid(){
	gridCustom.trigger('reloadGrid'); //重新载入
}

/**
 * 验证信息
 */
function validateCustomInfo(submitObj){
	if(!submitObj.template_name){
		app.show({content:'请填写名称,再保存',type:2});
		return false;
	}
	// else if(!submitObj.icon_src){
	// 	app.show({content:'请填写图标,再保存',type:2});
	// 	return false;
	// }else if(!submitObj.cover_src){
	// 	app.show({content:'请填写封面,再保存',type:2});
	// 	return false;
	// }
	else if(!submitObj.description){
		app.show({content:'请填写描述,再保存',type:2});
		return false;
	}else if(!submitObj.wx_template_id){
		app.show({content:'请填写提交到微信开发平台代码库中的代码模版ID,再保存',type:2});
		return false;
	}else if(!submitObj.wx_ext_json){
		app.show({content:'请填写第三方自定义的配置,再保存',type:2});
		return false;
	}else if(!submitObj.wx_user_version){
		app.show({content:'请填写代码版本号，开发者可自定义,再保存',type:2});
		return false;
	}else if(!submitObj.wx_user_desc){
		app.show({content:'请填写代码描述，开发者可自定义,再保存',type:2});
		return false;
	}else if(!submitObj.is_deleted){
		app.show({content:'请填写是否删除,再保存',type:2});
		return false;
	}
	return true;
}

/**
 * 新增信息(展示)
 */
function addCustomInfoShow(){
	//初始化信息
	var target = $(addCustomFormId);
	ctrl.resetForm(target);//清空form内容

	target.find('img[name="img-icon_src"]').attr("src", config.getDefImgUrl());
	target.find('img[name="img-cover_src"]').attr("src", config.getDefImgUrl());

	target.find('div[name="img-div-package_atlas"] > img[name="first-img"]').siblings().remove();
	target.find('div[name="img-div-package_atlas"]').children('img').attr("src",config.getDefImgUrl()).show();

	app.toggleView(addCustomPartId);
}

/**
 * 新增信息
 */
function addCustomInfo(){
	var target = $(addCustomFormId);
	var submitObj = app.getFormData(target);//获取子元素的属性[form-flag="1"]的value属性值
	
	//验证数据
	if(!validateCustomInfo(submitObj)){
		return false;
	}
	//图集
	var fileResources = [];
	target.find('div[name="img-div-package_atlas"] span[class="img_remove_tag"]').each(function(index, item){
		console.log($(item).attr("data-id"));
		console.log($(item).attr("data-name"));
		fileResources.push({file_resource_id:$(item).attr("data-id"),file_resource_name:$(item).attr("data-name")});
	});
	submitObj.imgs = fileResources;
	
	//异步新增
	ajax.postAjaxData({
		url: urls.addCustom,
		data: submitObj,
		success: function(data) {
			ctrl.resetForm(target);//清空form内容
			
			app.toggleView(mainPartId,{isTriggerGrid: true});
			refreshCustomGrid();
		}
	});
}

/**
 * 编辑信息(展示)
 */
function editCustomInfoShow(rw){
	ajax.getAjaxData({
		url: app.getFullInfo(urls.getCustom,{template_id:rw.template_id}),
		success: function(data) {
			var result_obj = data;
	 		//数据填充
	 		var target = $(editCustomFormId);
	 		app.setFormData(target, result_obj);//当子元素的name属性值==key名,则设置子元素的value属性值为value值
	        target.find('input[name="create_time"]').val(app.getLongToStrYMDHMS(result_obj.create_time_long));//创建时间
	        target.find('input[name="modify_time"]').val(app.getLongToStrYMDHMS(result_obj.modify_time_long));//创建时间

			if(result_obj.icon_src_string){
				target.find('img[name="img-icon_src"]').attr({
					"src":result_obj.icon_src_string,"style":"height: 150px;width: 150px;"
				});
			}else{
				target.find('img[name="img-icon_src"]').attr("src", config.getDefImgUrl());
			}

			if(result_obj.cover_src_string){
				target.find('img[name="img-cover_src"]').attr({
					"src":result_obj.cover_src_string,"style":"height: 150px;width: 150px;"
				});
			}else{
				target.find('img[name="img-cover_src"]').attr("src", config.getDefImgUrl());
			}

			//图集
			target.find('div[name="img-div-package_atlas"] > img[name="first-img"]').siblings().remove();
			if(result_obj.imgs != null && result_obj.imgs.length > 0){
				target.find('div[name="img-div-package_atlas"] > img[name="first-img"]').hide();
				var html = '';
				$.each(result_obj.imgs, function (key,value) {
					html += '<div class="img_item"><img src="'+ value.file_resource_name_string +'"/>' +
						'<span class="img_remove_tag" data-id="'+value.file_resource_id+'" data-name="'+value.file_resource_name+'" onClick="removeImg(this)">&times;</span></div>';
				});
				target.find('div[name="img-div-package_atlas"]').append(html);
			}else{
				target.find('div[name="img-div-package_atlas"]').children('img').attr("src",config.getDefImgUrl()).show();
			}

	 		app.toggleView(editCustomPartId);
		}
	});
}

/**
 * 删除图集中的图片
 * @param obj
 */
function removeImg(obj){
	var file_resource_id = $(obj).attr('data-id');
	var file_resource_name = $(obj).attr('data-name');
	console.log(file_resource_id);
	console.log(file_resource_name);

	app.confirm({
		content: '确认要执行操作吗？',
		okCallback: function(){
			// var del_resource_url;
			// if(file_resource_id){
			// 	del_resource_url = app.getFullInfo(urls.delFileResource,{file_resource_id:file_resource_id})
			// }else{
			// 	del_resource_url = app.getFullInfo(urls.delFileResourceByName,{file_resource_name:file_resource_name.replace(".","-")})
			// }
			// ajax.deleteAjaxData({
			// 	url:del_resource_url,
			// 	success_callback:function(){
					var $atlas = $(obj).parent().parent();//图集层
					$(obj).parent().remove();
					var $langth = $atlas.children('div.img_item').length;
					if($langth < 1){
						$atlas.children('img').attr("src",config.getDefImgUrl()).show();
					}
			// 	}
			// });
		}
	});
}

/**
 * 编辑信息
 */
function editCustomInfo(){
	var target = $(editCustomFormId);
	var submitObj = app.getFormData(target);//获取子元素的属性[form-flag="1"]的value属性值
	
	//验证数据
	if(!submitObj.template_id){
		return false;
	}else if(!validateCustomInfo(submitObj)){
		return false;
	}
	//图集
	var fileResources = [];
	target.find('div[name="img-div-package_atlas"] span[class="img_remove_tag"]').each(function(index, item){
		console.log($(item).attr("data-id"));
		console.log($(item).attr("data-name"));
		fileResources.push({file_resource_id:$(item).attr("data-id"),file_resource_name:$(item).attr("data-name")});
	});
	submitObj.imgs = fileResources;
	
	//异步更新
	ajax.putAjaxData({
		url: app.getFullInfo(urls.editCustom,{template_id:submitObj.template_id}),
		data: submitObj,
		success: function(data) {
			ctrl.resetForm(target);//清空form内容
			
			app.toggleView(mainPartId,{isTriggerGrid: true});
			refreshCustomGrid();
		}
	});
}
