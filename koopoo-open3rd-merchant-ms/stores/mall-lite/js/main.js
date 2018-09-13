/**
 * Created by Gen on 16/9/1.
 */

$(function () {
	/* 初始化页面 */
	nav.init({
        TEMPLATE_ID: 18, //模板id
		defaultId: '-1', //默认显示的页面id
		data: [{
			id: '-1', name: '概况', active: true,
			href: '../../../page/store/dashboard.html',
			iconClass: 'fa-desktop'
		}, {
			id: '1',
			name: '商品',
			href: '',
			iconClass: 'fa-glass',
			children: [
				{id: '1-2', name: '规格', href: '../../../page/store/specifications.html'},
				{id: '1-3', name: '商品', href: '../../../page/store/products-n-c.html'}
			]
		}, {
			id: '3', name: '订单',
			href: '',
			iconClass: 'fa-shopping-basket',
			children: [
				{v_id: 1, id: '3-1', name: '订单', href: '../../../page/store/order.html'},
				{v_id: 2, id: '3-2', name: '支付', href: '../../../page/store/pay.html'}
			]
		},
		{
			id: '6', name: '客户',
			href: '',
			iconClass: 'fa-id-card',
			children: [
				{id: '6-1', name: '会员', href: '../../../page/store/user.html'},
				{id: '6-2', name: '反馈', href: '../../../page/store/feedback.html'}
			]
		},{
			id: '5', name: '小程序',
			iconClass: 'fa-cogs',
			children: [
				{id: '5-1', name: '配置', href: '../../../page/store/shop-setup.html'},
				{id: '5-2', name: '上线', href: '../../../page/store/shop-public.html'},
				{id: '5-3', name: '资料', href: '../../../page/store/shop-edit.html'},
                {id: '5-6', name: '工具', href: '../../../page/store/shop-micro-sidebar.html'},
				{id: '5-5', name: '续费', className: 'color-orange', href: '../../../page/store/shop-buy.html'}
			]
		}],
		$contains: $('#nav'),
		$iframe: $('#mainIFrame'),
		$navLocation: $('#navLocation'),
		callback: function (shopInfoData) {
			var templateId = shopInfoData.template_id;
			if(this.TEMPLATE_ID === templateId || templateId <= 2) {
				this.initPage();
			} else {
				this.backToList();
			}
		}
	});
});
