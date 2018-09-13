var urls = {
	listCustom: 'ms/users/list/',
	addCustom: 'ms/users/',
	getCustom: 'ms/users/{user_id}/',
	editCustom: 'ms/users/{user_id}/'
};
var mainPartId = '#MainPart';
var searchCustomFormId='#SearchCustomForm',gridCustom,
gridCustomTableId='#GridCustomTable',gridCustomPagerId='#GridCustomPager',
addCustomPartId='#AddCustomPart',addCustomFormId='#AddCustomForm',
editCustomPartId='#EditCustomPart',editCustomFormId='#EditCustomForm';

var SexList = [];

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

	//性别
	dict.getSexForData(null, SexList);
	ctrl.setSelect2Option(searchTarget.find('select[name="sex"]'), SexList);
	ctrl.setSelect2Option(addTarget.find('select[name="sex"]'), SexList);
	ctrl.setSelect2Option(editTarget.find('select[name="sex"]'), SexList);

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
}

/**
 * 初始化grid
 */
function initCustomGrid(){
	var options = {
		url: urls.listCustom,
		colModel:[//每一列的具体信息，index是索引名，当需要排序时，会传这个参数给后端
			{title:'ID',name:'user_id',index:'user_id',width:80,sortable:true,frozen:true},
			{title:'UnionID',name:'union_id',index:'union_id',width:150,sortable:false,frozen:true},
			{title:'昵称',name:'nickname',index:'nickname',width:120,sortable:false,frozen:true},
			{title:'性别',name:'sex',index:'sex',width:80,sortable:false,frozen:true,
				formatter:function(v, opt, r){
					return dict.getSexForHtml(v);
				}
			},
			{title:'头像',name:'avatar_url',index:'avatar_url',width:100,sortable:false,frozen:true,
				formatter:function(v, opt, r){
					if(r.avatar_url_string == null) return '';
					return '<a target="_blank" href="'+r.avatar_url_string+
						'"><img src="'+r.avatar_url_string+'" alt="查看原图" style="height:20px;"/></a>';
				}
			},
			{title:'城市',name:'city',index:'city',width:80,sortable:false},
			{title:'创建时间',name:'create_time',index:'create_time',width:150,sortable:false,
				formatter:function(v, opt, r){
					return app.getLongToStrYMDHMS(r.create_time_long);
				}
			},
			{title:'省份/直辖市',name:'province',index:'province',width:90,sortable:false},
			{title:'国家',name:'country',index:'country',width:80,sortable:false},
			{title:'微信公众号ID',name:'open_h5_id',index:'open_h5_id',width:120,sortable:false},
			{title:'微信小程序ID',name:'open_xcx_id',index:'open_xcx_id',width:120,sortable:false},
			{title:'修改时间',name:'modify_time',index:'modify_time',width:150,sortable:false,
				formatter:function(v, opt, r){
					return app.getLongToStrYMDHMS(r.modify_time_long);
				}
			}
        ],
        sortname: 'user_id',
        sortorder: 'desc',
//		multiselect: true,
// 		caption: '用户表',
		nav_button_arr: []
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
	if(!submitObj.union_id){
		app.show({content:'请填写UnionID,再保存',type:3});
		return false;
	}else if(!submitObj.open_h5_id){
		app.show({content:'请填写微信公众号ID,再保存',type:3});
		return false;
	}else if(!submitObj.open_xcx_id){
		app.show({content:'请填写微信小程序ID,再保存',type:3});
		return false;
	}else if(!submitObj.nickname){
		app.show({content:'请填写昵称,再保存',type:3});
		return false;
	}else if(!submitObj.sex){
		app.show({content:'请填写性别,再保存',type:3});
		return false;
	}else if(!submitObj.city){
		app.show({content:'请填写城市,再保存',type:3});
		return false;
	}else if(!submitObj.avatar_url){
		app.show({content:'请填写头像,再保存',type:3});
		return false;
	}else if(!submitObj.province){
		app.show({content:'请填写省份/直辖市,再保存',type:3});
		return false;
	}else if(!submitObj.country){
		app.show({content:'请填写国家,再保存',type:3});
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
		url: app.getFullInfo(urls.getCustom,{user_id:rw.user_id}),
		success: function(data) {
			var result_obj = data;
	 		//数据填充
	 		var target = $(editCustomFormId);
	 		app.setFormData(target, result_obj);//当子元素的name属性值==key名,则设置子元素的value属性值为value值
	        target.find('input[name="create_time"]').val(app.getLongToStrYMDHMS(result_obj.create_time_long));//创建时间
	        target.find('input[name="modify_time"]').val(app.getLongToStrYMDHMS(result_obj.modify_time_long));//创建时间
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
	if(!submitObj.user_id){
		return false;
	}else if(!validateCustomInfo(submitObj)){
		return false;
	}
	
	//异步更新
	ajax.putAjaxData({
		url: app.getFullInfo(urls.editCustom,{user_id:submitObj.user_id}),
		data: submitObj,
		success: function(data) {
			ctrl.resetForm(target);//清空form内容
			
			app.toggleView(mainPartId,{isTriggerGrid: true});
			refreshCustomGrid();
		}
	});
}
