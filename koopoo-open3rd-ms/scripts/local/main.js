/**
 * Created by Gen on 16/9/1.
 */

var nav = {
    $contains: null,
    currentUser: null,
    roleMap: null,
    data: null,
    init: function(options){
        if($.isEmptyObject(options)) return console.warn('模版初始化失败.');
        for (var key in options) {
            if (!this[key] || !this.hasOwnProperty(key)) this[key] = options[key];
            else console.warn('重复的键名:', key);
        }

        var self = this;
        shopBase.getUserInfo(function(data){
			console.log(data);
			self.currentUser = data;
			console.log(self.currentUser);
			self.pageData = shopBase.getUrlParams();

			self.initHtml();
			self.initEvents();
			self.initPageEvent();
			if(!$.browser.webkit) {
				new IScroll('#navWrapper', {
					scrollbars: 'custom',
					mouseWheel: true,
					interactiveScrollbars: true,
					shrinkScrollbars: 'scale',
					fadeScrollbars: true
				});
			}

			shopBase.setDataBinds(data);
        });
    },
    initEvents: function(){
        var self = this;
		//点击父项菜单
        this.$contains.on('click', '.nav-title', function(e, object){
            var title = $(this).data('title'),
            	href = $(this).data('href');

			self.$contains.find('li.active, p.active').removeClass('active');

			if(href) {
				self.setIframeSrc(href, object);
				self.setNavLocation($(this));
				$(this).addClass('active');
			}
			$(this).parent().addClass('nav-current')
				.siblings('.nav-current').removeClass('nav-current');
        });
		//点击子项菜单
        this.$contains.on('click', 'li', function(e, object){
        	var title = $(this).data('title'),
	        	href = $(this).data('href');

            if(href) {
				self.setIframeSrc(href, object);
				self.setNavLocation($(this));
			}

            self.$contains.find('li.active, p.active').removeClass('active');
			$(this).addClass('active').parent().parent().addClass('nav-current')
				.siblings('.nav-current').removeClass('nav-current');
        });
    },
	setIframeSrc: function (url, object) {
		if(!url || url == '#' || object === false) return;
		var search = '';
		if(!$.isEmptyObject(object)) { //有URL参数
			var parameters = [];
			for(var key in object) parameters.push(key +'='+ object[key]);
			search = parameters.join('&');
			url += (/\?/.test(url) ? '&' : '?') + search;
		}
		this.$iframe.attr('src', url);
	},
    initHtml: function(){
        if(Object.prototype.toString.call(this.data) != '[object Array]') return;
		var pageId = this.getLocationHashData().I || this.pageData._I;
		var href, dataId;

		this.data.forEach(filterData);
		function filterData(item) {
			if(pageId) { //有url参数
				if(item.id == pageId) {
					href = item.href;
					dataId = item.id;
					item.active = true;
				} else {
					if(item.active) item.active = false;
				}
			} else {
				if(href) {
					if(item.active) item.active = false;
				} else {
					if(item.active) {
						href = item.href;
						dataId = item.id;
						item.active = true;
					}
				}
			}
			if(item.children) {
				item.children.forEach(filterData);
			}
		}
		this.$iframe.attr('src', href || this.defaultHref);

		var filter_data=[];
		this.data.forEach(function (item) {
			if(!nav.checkedAuthMenu(item)) return;
			filter_data.push(item);
		});
		console.log(filter_data);
        // var html = template('navTemplate', {listData: this.data});
        var html = template('navTemplate', {listData: filter_data});

		if(!$.browser.webkit) {
			this.$contains.find('.main-nav-content').html(html);
		} else {
			this.$contains.addClass('webkit').html(html);
		}
		this.setNavLocation(this.$contains.find('[data-id='+ (dataId || this.defaultId) +']'))
    },
    initPageEvent: function(){
		$('#logout').bind('click',function(){
			shopBase.logout();
		});

		$('#btnMainUser').hover(function () {
			$('#mainUserBox').show();
		}, function () {
			$('#mainUserBox').hide();
		});

		//弹出修改密码
		$('#btnEditPwd').bind('click',function(){
			$('#editPwdModal').modal('show').find('input').val('');
		});

		//修改密码
		$('#btnSavePwd').bind('click',function(){
			var target = $('#editPwdModal').find('.modal-body');
			var data = shopBase.getAndVerificationData(target, true);
			if(!data) return;

			if(data.user_pwd == data.new_pwd){
				shopBase.showTip('新旧密码不能相同', true);
				return;
			}
			ajax.putAjaxData({
				url: 'ms/sysusers/password',
				data: data,
				success: function(){
					app.confirm({
						content: '修改成功，需重新登录。是否跳转登录页？',
						okCallback: function(){
							top.location.href = config.getFullPath('page/login.html');
						}
					});
				}
			});
		});

    },
	getLocationHashData: function () { //获取hash中的id值
		var hash = location.hash.replace(/#/, '');
		var paramsObject = {};
		if(/^[^_]+_[^_]+$/.test(hash)) { //套路
			var arr = hash.split('_');
			paramsObject[arr[0]] = arr[1];
		}
		return paramsObject;
	},
	/**
	 * 判断是否是权限菜单
	 */
    checkedAuthMenu: function(menu){
    	var auth_menu = app.getObject(this.roleMap, this.currentUser.role_id);
		if(auth_menu.type == 'all'){
			return true;
		}else if(auth_menu.type == 'notcontains'){
			if($.inArray(menu.id , auth_menu.val) > -1){
				return false;
			}
			return true;
		}else if(auth_menu.type == 'contains'){
			if($.inArray(menu.id , auth_menu.val) > -1){
				return true;
			}
			return false;
		}
		return false;
    },
	/* 手动触发点击菜单
	 * 参数 {}
	 * */
	gotoAndClickItem: function(object, isRefresh){
		if($.isEmptyObject(object) || typeof object.id != 'string') return;
		var $item = this.$contains.find('[data-id='+ object.id +']').first();
		if($item.length) {
			$item.trigger('click', isRefresh === false ? false : object);
		} else {
			app.show('没找到页面:'+ object.id);
		}
	},
	setNavLocation: function ($target) { //显示页面导航
		if(!$target.length) return ;

		var html = '';
		var $parent = $target.parent();
		if($parent.is('ul')) {
			html = '<span>'+ $parent.siblings('.nav-title').data('title') + '</span>';
		}
		html += '<span class="active">'+ $target.data('title') + '</span>';

		document.title = $target.data('title') + (this.shopInfoData ? ' - '+ this.shopInfoData.shop_name : '');
		nav.$navLocation.html(html);

		var id = $target.data('id');
		if(id) location.hash = 'I_'+ id; //设置URL的hash
	}
};


$(function(){
	nav.init({
		defaultHref: 'index.html',
		defaultId: '-1', //默认显示的页面id
		roleMap: {
			1: {type:'all',val:['all']},
			2: {type:'contains',val:[
				'-1',
				'4','4-1','4-2'
			]}
		},
		data: [{
			id: '-1', name: '概况',
			href: 'index.html',
			iconClass: 'fa-desktop'
		}, {
            id: '1',
            name: '用户',
            href: '',
            iconClass: 'fa-user-circle',
            children: [
                {id: '1-1', name: '用户', href: 'user.html'}
            ]
        },{
            id: '2',
            name: '商户',
            href: '',
            iconClass: 'fa-id-card',
            children: [
                {id: '1-1', name: '商户', href: 'merchant.html'},
                {id: '1-1', name: '店铺', href: 'shop.html'},
                {id: '7-1', name: '授权', href: 'authorizer_info.html'}
            ]
        },{
            id: '3',
            name: '模板',
            href: '',
            iconClass: '',
            children: [
                // {id: '3-1', name: '行业', href: 'sys_industry.html'},
                {id: '3-2', name: '模板', href: 'sys_template.html'}
            ]
        }, {
            id: '4',
            name: '代理商',
            href: '',
            iconClass: 'fa-odnoklassniki ',
            children: [
                {id: '4-1', name: '关联商户', href: 'agent_shop.html',active:true},
                {id: '4-2', name: '支付码', href: 'agent_ticket_code.html'}
            ]
        },{
            id: '6',
            name: '订单',
            href: '',
            iconClass: 'fa-shopping-cart',
            children: [
                {id: '6-1', name: '订单', href: 'sys_order.html'},
                {id: '6-2', name: '支付', href: 'sys_pay.html'}
            ]
        }, {
            id: '99',
            name: '系统',
            href: '',
            iconClass: 'fa-magnet',
            children: [
                {id: '99-1', name: '用户', href: 'sys_user.html'},
                {id: '99-2', name: '反馈', href: 'feedback.html'}
            ]
        }],
	    $contains: $('#nav'),
		$iframe: $('#mainIFrame'),
		$navLocation: $('#navLocation')
	});

});