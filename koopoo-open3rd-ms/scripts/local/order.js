var urls = {
	listCustom: 'ms/orders/list/',
	addCustom: 'ms/orders/',
	getCustom: 'ms/orders/{order_id}/',
	editCustom: 'ms/orders/{order_id}/'
};
var mainPartId = '#MainPart';
var searchCustomFormId='#SearchCustomForm',gridCustom,
	gridCustomTableId='#GridCustomTable',gridCustomPagerId='#GridCustomPager';

var IsCommentList=[];
var IsDeletedList=[];
var PayStatusList=[];

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
	//是否已评论
	dict.getCommonYesOrNoForData_B(null, IsCommentList);
	ctrl.setSelect2Option(searchTarget.find('select[name="is_comment"]'), IsCommentList);
	//已删除
	dict.getCommonYesOrNoForData_B(null, IsDeletedList);
	ctrl.setSelect2Option(searchTarget.find('select[name="is_deleted"]'), IsDeletedList);
	//支付状态
	dict.getOrderPayStatusForData(null, PayStatusList);
	ctrl.setSelect2Option(searchTarget.find('select[name="pay_status"]'), PayStatusList);

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
			{title:'订单ID',name:'order_id',index:'order_id',width:120,sortable:true},
			{title:'订单流水号',name:'order_flow_id',index:'order_flow_id',width:180,sortable:false},
			// {title:'用户ID',name:'user_id',index:'user_id',width:120,sortable:false},
			{title:'总原价',name:'total_price',index:'total_price',width:120,sortable:false},
			{title:'成交价',name:'sell_price',index:'sell_price',width:120,sortable:false},
			{title:'支付状态',name:'pay_status',index:'pay_status',width:80,sortable:false,frozen:true,
				formatter:function(v, opt, r){
					return dict.getOrderPayStatusForHtml(v);
				}
			},
			{title:'支付金额',name:'pay_amount',index:'pay_amount',width:100,sortable:false},
			{title:'已删除',name:'is_deleted',index:'is_deleted',width:80,sortable:false,
				formatter:function(v, opt, r){
					return dict.getCommonYesOrNoForHtml_B(v);
				}
			},
			{title:'物流状态',name:'shipping_status',index:'shipping_status',width:120,sortable:false,
				formatter:function(v, opt, r){
					return dict.getShippingStatusForHtml(v);
				}
			},
			{title:'用户备注',name:'remark',index:'remark',width:120,sortable:false},
			{title:'客服备注',name:'cs_remark',index:'cs_remark',width:120,sortable:false},
			{title:'订单标题',name:'title',index:'title',width:120,sortable:false},
			{title:'创建时间',name:'create_time',index:'create_time',width:150,sortable:false,
				formatter:function(v, opt, r){
					return app.getLongToStrYMDHMS(r.create_time_long);
				}
			}
		],
		sortname: 'order_id',
		sortorder: 'desc',
//		multiselect: true,
// 		caption: '订单基本信息',
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
