var urls = {
	listCustom: 'ms/syspays/list/',
	getCustom: 'ms/syspays/{sys_pay_id}/'
};
var mainPartId = '#MainPart';
var searchCustomFormId='#SearchCustomForm',gridCustom,
gridCustomTableId='#GridCustomTable',gridCustomPagerId='#GridCustomPager';

var SucceedList = [];

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

	dict.getCommonYesOrNoForData_B(null, SucceedList);
	ctrl.setSelect2Option(searchTarget.find('select[name="succeed"]'), SucceedList);

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
			{title:'支付ID',name:'sys_pay_id',index:'t.sys_pay_id',width:120,sortable:true},
			{title:'商户ID',name:'merchant_id',index:'t.merchant_id',width:120,sortable:false},
			{title:'店铺ID',name:'shop_id',index:'t.shop_id',width:120,sortable:false},
			{title:'订单流水号',name:'sys_order_flow_id',index:'t.sys_order_flow_id',width:120,sortable:false},
			{title:'支付流水号',name:'sys_pay_order_no',index:'t.sys_pay_order_no',width:120,sortable:false},
			{title:'支付渠道',name:'channel',index:'t.channel',width:120,sortable:false},
			{title:'总金额',name:'amount',index:'t.amount',width:120,sortable:false},
			{title:'终端IP',name:'client_ip',index:'t.client_ip',width:120,sortable:false},
			{title:'支付成功',name:'succeed',index:'t.succeed',width:120,sortable:false,
				formatter:function(v, opt, r){
					return dict.getCommonYesOrNoForHtml_B(v);
				}
			},
			{title:'备注',name:'remark',index:'t.remark',width:120,sortable:false},
			{title:'版本号',name:'version',index:'t.version',width:120,sortable:false},
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
        sortname: 't.sys_pay_id',
        sortorder: 'desc',
//		multiselect: true,
// 		caption: '系统支付记录',
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

