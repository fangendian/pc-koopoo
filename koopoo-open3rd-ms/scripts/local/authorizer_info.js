var urls = {
	listCustom: 'ms/authorizerinfos/list/',
	addCustom: 'ms/authorizerinfos/',
	getCustom: 'ms/authorizerinfos/{authorizer_info_id}/',
	editCustom: 'ms/authorizerinfos/{authorizer_info_id}/'
};
var mainPartId = '#MainPart';
var searchCustomFormId='#SearchCustomForm',gridCustom,
gridCustomTableId='#GridCustomTable',gridCustomPagerId='#GridCustomPager',
addCustomPartId='#AddCustomPart',addCustomFormId='#AddCustomForm',
editCustomPartId='#EditCustomPart',editCustomFormId='#EditCustomForm';

var IsCancelAuthList=[];

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
	//已取消授权
	dict.getCommonYesOrNoForData_B(null, IsCancelAuthList);
	ctrl.setSelect2Option(searchTarget.find('select[name="is_cancel_auth"]'), IsCancelAuthList);
	ctrl.setSelect2Option(addTarget.find('select[name="is_cancel_auth"]'), IsCancelAuthList);
	ctrl.setSelect2Option(editTarget.find('select[name="is_cancel_auth"]'), IsCancelAuthList);
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
			{title:'ID',name:'authorizer_info_id',index:'authorizer_info_id',width:100,sortable:true},
			{title:'授权方appid',name:'authorizer_appid',index:'authorizer_appid',width:180,sortable:false},
			{title:'公众号类型',name:'service_type_info',index:'service_type_info',width:100,sortable:false,
				formatter:function(v, opt, r){
					return dict.getServiceTypeForHtml(v);
				}
			},
			{title:'授权方昵称',name:'nick_name',index:'nick_name',width:140,sortable:false},
			{title:'原始ID',name:'user_name',index:'user_name',width:150,sortable:false},
			{title:'授权方头像',name:'head_img_src',index:'head_img_src',width:100,sortable:false,
				formatter:function(v, opt, r){
					if(r.head_img_src_string == null) return '';
					return '<a target="_blank" href="'+r.head_img_src_string+
		   			'"><img src="'+r.head_img_src_string+'" alt="查看原图" style="height:20px;width:20px;"/></a>';
				}
			},
			{title:'授权方二维码',name:'qrcode_src',index:'qrcode_src',width:100,sortable:false,
				formatter:function(v, opt, r){
					if(r.qrcode_src_string == null) return '';
					return '<a target="_blank" href="'+r.qrcode_src_string+
		   			'"><img src="'+r.qrcode_src_string+'" alt="查看原图" style="height:20px;width:20px;"/></a>';
				}
			},
			{title:'公众号的主体名称',name:'principal_name',index:'principal_name',width:220,sortable:false},
			{title:'微信商户号',name:'mch_id',index:'mch_id',width:120,sortable:false},
			// {title:'微信商户后台设置的Key',name:'mch_key',index:'mch_key',width:120,sortable:false},
			{title:'已取消授权',name:'is_cancel_auth',index:'is_cancel_auth',width:100,sortable:false,
	        	formatter:function(v, opt, r){
	        		return dict.getCommonYesOrNoForHtml_BR(v);
	        	}
	        },
			{title:'创建时间',name:'create_time',index:'create_time',width:150,sortable:false,
				formatter:function(v, opt, r){
					return app.getLongToStrYMDHMS(r.create_time_long);
				}
			},
			{title:'修改时间',name:'modify_time',index:'modify_time',width:150,sortable:false,
				formatter:function(v, opt, r){
					return app.getLongToStrYMDHMS(r.modify_time_long);
				}
			}
        ],
        sortname: 'authorizer_info_id',
        sortorder: 'desc',
//		multiselect: true,
// 		caption: '授权方的帐号基本信息',
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
