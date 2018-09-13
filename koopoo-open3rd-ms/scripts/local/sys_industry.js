var urls = {
	listCustom: 'ms/sysindustrys/list/',
	addCustom: 'ms/sysindustrys/',
	getCustom: 'ms/sysindustrys/{industry_id}/',
	editCustom: 'ms/sysindustrys/{industry_id}/',
	getPr: 'ms/sysindustrys/{industry_id}/pr',
	putPr: 'ms/sysindustrys/{industry_id}/pr',
	getList: 'ms/systemplates/list',
	uploadFile: 'ms/files/upload/'
};
var mainPartId = '#MainPart';
var searchCustomFormId='#SearchCustomForm',gridCustom,
gridCustomTableId='#GridCustomTable',gridCustomPagerId='#GridCustomPager',
addCustomPartId='#AddCustomPart',addCustomFormId='#AddCustomForm',
editCustomPartId='#EditCustomPart',editCustomFormId='#EditCustomForm';

var prPartId='#prPart',prFormId='#prForm';

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

    //关联
    $(prFormId+'-saveBtn').bind('click',function(){
        prInfo();
    });
    $(prFormId+'-cancelBtn').bind('click',function(){
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

	/**
	 * 加载套餐全量数据(本地化检索，先不要跟原有套餐数据混用)
	 */
	var page = {'pageSize':2147483647,'pageNumber':1};
	ajax.getAjaxData({
		url: urls.getList,
		data: page,
		success: function(data) {
			var result = data.result;

			var tempMap = [];
			result.map(function(item, index){
				tempMap[item.template_id] = item;
			});
			config.temp['List'] = result;//本地数据库
			config.temp['IdLeftList'] = [];//左侧数据ID列表（实时）
			config.temp['Map'] = tempMap;//本地数据库
		}
	});

	//套餐双向迁移
	var _rightEventFun = function(option){//右移
		option.each(function(index){
			config.temp.IdLeftList.remove($(this).val());
		});
	};
	var _leftEventFun = function(option){//左移
		option.each(function(index){
			config.temp.IdLeftList.push($(this).val());
		});
	};
	$(prFormId+'-template_id').bilateralTransfer({
		rightAllEventFun: _rightEventFun,
		rightEventFun: _rightEventFun,
		leftEventFun: _leftEventFun,
		leftAllEventFun: _leftEventFun
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
			{title:'ID',name:'industry_id',index:'t.industry_id',width:80,sortable:true},
			{title:'名称',name:'industry_name',index:'t.industry_name',width:120,sortable:false},
			{title:'图标',name:'icon_src',index:'t.icon_src',width:80,sortable:false,
				formatter:function(v, opt, r){
					if(!r.icon_src_string) return '';
					return '<a target="_blank" href="'+r.icon_src_string+
		   			'"><img src="'+r.icon_src_string+'" alt="查看原图" style="height:20px;width:20px;"/></a>';
				}
			},
			{title:'封面',name:'cover_src',index:'t.cover_src',width:80,sortable:false,
				formatter:function(v, opt, r){
					if(!r.cover_src_string) return '';
					return '<a target="_blank" href="'+r.cover_src_string+
		   			'"><img src="'+r.cover_src_string+'" alt="查看原图" style="height:20px;width:20px;"/></a>';
				}
			},
			{title:'描述',name:'description',index:'t.description',width:300,sortable:false},
			{title:'顺序',name:'orders',index:'t.orders',width:80,sortable:false},
			{title:'是否删除',name:'is_deleted',index:'t.is_deleted',width:100,sortable:false,
	        	formatter:function(v, opt, r){
	        		return dict.getCommonYesOrNoForHtml_B(v);
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
        sortname: 't.orders,t.industry_id',
        sortorder: 'desc',
//		multiselect: true,
// 		caption: '行业',
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
			},
			{
				caption: '关联模板',
				title: '关联模板',
				buttonicon: 'fa fa-plus-circle purple',
				onClickButton: function(){
					var rw = ctrl.getSingleSelectedRowData(gridCustomTableId);
					if(!rw) return false;
					prInfoShow(rw);
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
	if(!submitObj.industry_name){
		app.show({content:'请填写名称,再保存',type:2});
		return false;
	}else if(!submitObj.icon_src){
		app.show({content:'请填写图标,再保存',type:2});
		return false;
	}else if(!submitObj.cover_src){
		app.show({content:'请填写封面,再保存',type:2});
		return false;
	}else if(!submitObj.description){
		app.show({content:'请填写描述,再保存',type:2});
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
		url: app.getFullInfo(urls.getCustom,{industry_id:rw.industry_id}),
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

	 		app.toggleView(editCustomPartId);
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
	if(!submitObj.industry_id){
		return false;
	}else if(!validateCustomInfo(submitObj)){
		return false;
	}
	
	//异步更新
	ajax.putAjaxData({
		url: app.getFullInfo(urls.editCustom,{industry_id:submitObj.industry_id}),
		data: submitObj,
		success: function(data) {
			ctrl.resetForm(target);//清空form内容
			
			app.toggleView(mainPartId,{isTriggerGrid: true});
			refreshCustomGrid();
		}
	});
}

/**
 * 关联信息控件展示
 */
function prInfoShow(rw){
	//初始化信息
	var target = $(prFormId);
	var obj = {
		industry_id: rw.industry_id,
		industry_name: rw.industry_name
	};
	app.setFormData(target, obj);//当子元素的name属性值==key名,则设置子元素的value属性值为value值

	//填充左边数据(套餐)
	_fillBilateralTransfer(prFormId+'-template_id', rw.industry_id);
	app.toggleView(prPartId);
}

/**
 * 关联信息
 */
function prInfo(){
	var target = $(prFormId);
	var submitObj = app.getFormData(target);//获取子元素的属性[form-flag="1"]的value属性值
	var template_id_arr = [];
	$(prFormId+'-template_id').find('[move="right"] > option').each(function(){
		template_id_arr.push($(this).val());
	});
	//验证数据
	if(!submitObj.industry_id){
		return false;
	}

	submitObj['template_id_list'] = template_id_arr;
	//异步更新
	ajax.putAjaxData({
		url: app.getFullInfo(urls.putPr,{industry_id:submitObj.industry_id}),
		data: submitObj,
		success:function(data) {
			ctrl.resetForm(target);//清空form内容
			app.toggleView(mainPartId,{isTriggerGrid: true});
		}
	});
}

/**
 * 填充双向迁移（组件）的数据（商家）
 */
function _fillBilateralTransfer($bt_id, industry_id){
	var $left = $($bt_id).find('[move="left"]');
	var $right = $($bt_id).find('[move="right"]');
	$left.empty();
	config.temp.IdLeftList.removeAll();
	if(config.temp.List.length > 0){
		config.temp.List.map(function(item, index){
			if(item.is_disable == 0){//可用商品
				config.temp.IdLeftList.push(item.template_id);
			}
		});
		ctrl.setSelectOption($left, {
			data: config.temp.List,
			is_append: true,
			ref_key: 'template_id',
			ref_val: 'template_name',
			flag_color: function(item){
				return (item.is_disable) ? 1 : 0;
			}
		});
	}

	if(industry_id){
		$right.empty();
		//获取关联信息
		ajax.getAjaxData({
			url: app.getFullInfo(urls.getPr,{industry_id:industry_id}),
			data: {"pageSize":2147483647},
			success:function(data) {
				var result_list = data.result;
				if(result_list.length > 0){
					var selected_id_list = [];
					result_list.map(function(item, index){
						if(item.is_disable != 0){
							selected_id_list.push(item.template_id);
						}
					});

					$left.find('option').each(function(){
						if(selected_id_list.contains($(this).val())){
							config.temp.IdLeftList.remove($(this).val());//去除已选的
							$(this).appendTo($right);
						}
					});
				}
			}
		});
	}
}