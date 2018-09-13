var urls = {
	listCustom: 'ms/shops/list/',
	addCustom: 'ms/shops/',
	getCustom: 'ms/shops/{shop_id}/',
	editCustom: 'ms/shops/{shop_id}/'
};
var mainPartId = '#MainPart';
var searchCustomFormId='#SearchCustomForm',gridCustom,
gridCustomTableId='#GridCustomTable',gridCustomPagerId='#GridCustomPager',
addCustomPartId='#AddCustomPart',addCustomFormId='#AddCustomForm',
editCustomPartId='#EditCustomPart',editCustomFormId='#EditCustomForm';

var IsWxOnlineList=[];
var IsShowLogoList=[];
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
	//是否已上线
	dict.getCommonYesOrNoForData_B(null, IsWxOnlineList);
	ctrl.setSelect2Option([
        searchTarget.find('select[name="is_wx_online"]'),
        addTarget.find('select[name="is_wx_online"]'),
        editTarget.find('select[name="is_wx_online"]')
    ], IsWxOnlineList);
	// 过期时间
	ctrl.initLayDate(searchCustomFormId+'-expired_time_begin',{
		isclear: true
	},searchCustomFormId+'-expired_time_end',{
		isclear: true
	});
	ctrl.initLayDate(addCustomFormId+'-expired_time',{
		isclear: true
	});
	ctrl.initLayDate(editCustomFormId+'-expired_time',{
		isclear: true
	});
	//是否显示平台logo
	dict.getCommonYesOrNoForData_B(null, IsShowLogoList);
	ctrl.setSelect2Option([
        searchTarget.find('select[name="is_show_logo"]'),
        addTarget.find('select[name="is_show_logo"]'),
        editTarget.find('select[name="is_show_logo"]')
    ], IsShowLogoList);
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
}

/**
 * 初始化grid
 */
function initCustomGrid(){
	var options = {
		url: urls.listCustom,
		colModel:[//每一列的具体信息，index是索引名，当需要排序时，会传这个参数给后端
			{title:'ID',name:'shop_id',index:'t.shop_id',width:120,sortable:true},
			{title:'名称',name:'shop_name',index:'t.shop_name',width:120,sortable:false},
			// {title:'行业类型',name:'industry_id',index:'t.industry_id',width:120,sortable:false},
			{title:'模板ID',name:'template_id',index:'t.template_id',width:80,sortable:false},
			{title:'商户ID',name:'merchant_id',index:'t.merchant_id',width:80,sortable:false},
			{title:'授权信息ID',name:'authorizer_info_id',index:'t.authorizer_info_id',width:100,sortable:false},
			{title:'授权信息appid',name:'authorizer_appid',index:'t.authorizer_appid',width:160,sortable:false},
			{title:'描述',name:'description',index:'t.description',width:120,sortable:false},
			// {title:'主营商品分类',name:'product_category',index:'t.product_category',width:120,sortable:false},
			{title:'省级行政区ID',name:'province_id',index:'t.province_id',width:120,sortable:false},
			{title:'市级行政区ID',name:'city_id',index:'t.city_id',width:120,sortable:false},
			{title:'县级行政区ID',name:'district_id',index:'t.district_id',width:120,sortable:false},
			{title:'联系地址',name:'address',index:'t.address',width:120,sortable:false},
			{title:'公司名称',name:'company_name',index:'t.company_name',width:120,sortable:false},
			{title:'小程序已上线',name:'is_wx_online',index:'t.is_wx_online',width:120,sortable:false,
	        	formatter:function(v, opt, r){
	        		return dict.getCommonYesOrNoForHtml_B(v);
	        	}
	        },
			{title:'过期时间',name:'expired_time',index:'t.expired_time',width:150,sortable:false,
				formatter:function(v, opt, r){
					return app.getLongToStrYMDHMS(r.expired_time_long);
				}
			},
			{title:'最近提交审核的ID',name:'audit_id',index:'t.audit_id',width:140,sortable:false},
			{title:'是否显示平台logo',name:'is_show_logo',index:'t.is_show_logo',width:140,sortable:false,
	        	formatter:function(v, opt, r){
	        		return dict.getCommonYesOrNoForHtml_B(v);
	        	}
	        },
			{title:'备注',name:'remark',index:'t.remark',width:120,sortable:false},
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
        sortname: 't.shop_id',
        sortorder: 'desc',
//		multiselect: true,
// 		caption: '店铺表',
		nav_button_arr: [
            // {
				// caption: '新增',
				// title: '新增',
				// buttonicon: 'fa fa-plus-circle purple',
				// onClickButton: function(){
				// 	addCustomInfoShow();
				// },
				// position: 'last'//first last
		    // },
            // {
				// caption: '编辑',
				// title: '编辑',
				// buttonicon: 'fa fa-pencil blue',
				// onClickButton: function(){
				// 	var rw = ctrl.getSingleSelectedRowData(gridCustomTableId);
				// 	if(!rw) return false;
				// 	editCustomInfoShow(rw);
				// },
				// position: 'last'//first last
            // }
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