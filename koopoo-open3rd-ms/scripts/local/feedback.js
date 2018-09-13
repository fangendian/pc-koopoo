var urls = {
	listCustom: 'ms/feedbacks/list/',
	addCustom: 'ms/feedbacks/',
	getCustom: 'ms/feedbacks/{feedback_id}/',
	editCustom: 'ms/feedbacks/{feedback_id}/'
};
var mainPartId = '#MainPart';
var searchCustomFormId='#SearchCustomForm',gridCustom,
gridCustomTableId='#GridCustomTable',gridCustomPagerId='#GridCustomPager',
addCustomPartId='#AddCustomPart',addCustomFormId='#AddCustomForm',
editCustomPartId='#EditCustomPart',editCustomFormId='#EditCustomForm';


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
			{title:'ID',name:'feedback_id',index:'t.feedback_id',width:120,sortable:true},
			{title:'店铺ID',name:'shop_id',index:'t.shop_id',width:120,sortable:false},
			{title:'用户ID',name:'user_id',index:'t.user_id',width:120,sortable:false},
			{title:'邮箱地址',name:'email',index:'t.email',width:120,sortable:false},
			{title:'意见内容',name:'content',index:'t.content',width:120,sortable:false},
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
        sortname: 't.feedback_id',
        sortorder: 'desc',
//		multiselect: true,
// 		caption: '意见反馈',
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
