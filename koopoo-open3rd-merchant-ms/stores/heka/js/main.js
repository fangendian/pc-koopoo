/**
 * Created by Gen on 16/9/1.
 */

$(function () {
	/* 初始化页面 */
	nav.init({
        TEMPLATE_ID: 25, //模板id
		defaultId: '-1', //默认显示的页面id
		data: [{
			id: '-1', name: '概况', active: true,
			href: '../../../page/store/dashboard.html',
			iconClass: 'fa-desktop'
		}, {
			id: '1',
			name: '素材',
			href: '',
			iconClass: 'fa-file-text',
			children: [
				{id: '1-1', name: '图片', href: '../../../page/store/heka-source-picture.html'},
				{id: '1-2', name: '音频', href: '../../../page/store/heka-source-audio.html'},
				{id: '1-3', name: '视频', href: '../../../page/store/heka-source-video.html'}
            ]
		}, 
//		{
//			id: '6', name: '用户',
//			href: '',
//			iconClass: 'fa-id-card',
//			children: [
//				{id: '6-1', name: '用户', href: '../../../page/store/user.html'},
//				{id: '6-2', name: '反馈', href: '../../../page/store/feedback.html'}
//			]			
//		}, 
		{
			id: '5', name: '小程序',
			iconClass: 'fa-cogs',
			children: [
				{id: '5-1', name: '配置', href: '../../../page/store/shop-setup.html'},
				{id: '5-2', name: '上线', href: '../../../page/store/shop-public.html'},
				{id: '5-3', name: '资料', href: '../../../page/store/shop-edit.html'},
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
// 				this.initPage();//heka
			}
		}
	});

});
