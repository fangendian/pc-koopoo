var urls = {
	listCustom: 'ms/sysusers/list/',
	addCustom: 'ms/sysusers/',
	getCustom: 'ms/sysusers/{user_id}/',
	editCustom: 'ms/sysusers/{user_id}/'
};
var mainPartId = '#MainPart';
var searchCustomFormId='#SearchCustomForm',gridCustom,
gridCustomTableId='#GridCustomTable',gridCustomPagerId='#GridCustomPager',
addCustomPartId='#AddCustomPart',addCustomFormId='#AddCustomForm',
editCustomPartId='#EditCustomPart',editCustomFormId='#EditCustomForm';

var RoleList=[];
var StatusList=[];

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

	//角色
	dict.getAuthRoleForData(null, RoleList);
	ctrl.setSelect2Option(searchTarget.find('select[name="role_id"]'), RoleList);
	ctrl.setSelect2Option(editTarget.find('select[name="role_id"]'), RoleList);

	//状态
	dict.getCommonYesOrNoForData_A(null, StatusList);
	ctrl.setSelect2Option(addTarget.find('select[name="status"]'), StatusList);
	ctrl.setSelect2Option(editTarget.find('select[name="status"]'), StatusList);

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
			{title:'管理用户ID',name:'user_id',index:'t.user_id',width:120,sortable:true},
			{title:'管理用户名称',name:'user_name',index:'t.user_name',width:160,sortable:false},
			{title:'是否激活',name:'status',index:'t.status',width:80,sortable:false,
				formatter:function(v, opt, r){
					return dict.getCommonYesOrNoForHtml_A(v);
				}
			},
			{title:'角色',name:'role_id',index:'t.role_id',width:100,sortable:false,
				formatter:function(v, opt, r){
					return dict.getAuthRoleForHtml(v);
				}
			},
			{title:'备注',name:'remark',index:'t.remark',width:300,sortable:false},
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
        sortname: 't.user_id',
        sortorder: 'desc',
//		multiselect: true,
// 		caption: '后台用户信息',
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
    if(!app.isUsername(submitObj.user_name)){
        app.show({content:'请输入有效的长度5-16位的用户名,只能包含英文字母,数字,特殊字符"_,@,."',type:2});
        return false;
    }else if(!submitObj.user_pwd || submitObj.user_pwd.length < 6){
		app.show({content:'请填写管理用户密码,长度至少为6位,再保存',type:2});
		return false;
	}else if(!submitObj.status){
		app.show({content:'请填写管理用户状态,再保存',type:2});
		return false;
	}else if(!submitObj.remark){
		app.show({content:'请填写备注,再保存',type:2});
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
