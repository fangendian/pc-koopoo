/**
 * Created by Gen on 16/9/1.
 */

$(function () {
	/* 初始化页面 */
	nav.init({
        TEMPLATE_ID: 11, //模板id
		defaultId: '-1', //默认显示的页面id
		data: [{
			id: '-1', name: '概况', active: true,
			href: '../../../page/store/dashboard.html',
			iconClass: 'fa-desktop'
		}, {
			id: '1',
			name: '内容',
			href: '',
			iconClass: 'fa-file-text',
			children: [
				// {id: '1-1', name: '分类', href: '../../../page/store/categories.html'},
				{id: '1-3', name: '文章', href: 'articles.html'},
				{id: '1-4', name: '专题', href: '../../../page/store/article-themes.html'}
            ]
		}, {
			id: '6', name: '反馈',
			href: '../../../page/store/feedback.html',
			iconClass: 'fa-commenting'
		}, {
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
			if(this.TEMPLATE_ID === templateId) {
				this.initPage();
			} else {
				this.backToList();
			}
		}
	});

});
