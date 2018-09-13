/**
 * Created by gen on 2017/6/17.
 */
(function () {
    var __init = false;
    var isPageRightLoaded = false;
    var nav = {
        $contains: null,
        currentUser: null,
        data: null,
        version: window.__version,
        defaultHref: '../../../page/store/dashboard.html',
        init: function(options){
            if($.isEmptyObject(options)) return console.warn('模版初始化失败.');
            for (var key in options) {
                if (!this[key] || !this.hasOwnProperty(key)) this[key] = options[key];
                else console.warn('重复的键名:', key);
            }

            var self = this;
            this.paramVStr = this.version ? '?v='+ this.version : '';
            shopBase.getUserInfo(function(data){
                self.currentUser = data;
                self.pageData = shopBase.getUrlParams();

                getPageRight();

                shopBase.setDataBinds(data);
                self.getShopInfoAndSetData(function (shopInfoData) {
                    if(shopInfoData.is_deleted) {
                        self.backToList('抱歉，您的当前的小程序可能已经删除！');
                        return;
                    }
                    shopBase.setDataBinds(shopInfoData, '.caption');
                    if(typeof self.callback === 'function') self.callback(shopInfoData);
                }, true);
            });
        },
        initEvents: function(){
            if(__init) return;

            var self = this;
            //点击父项菜单
            this.$contains.on('click', '.nav-title', function(e, object){
                var title = $(this).data('title'),
                    href = $(this).data('href');

                if(href) {
                    self.$contains.find('li.active, p.active').removeClass('active');

                    self.setIFrameSrc(href, object);
                    self.setNavLocation($(this));
                    $(this).addClass('active');
                    $(this).parent().addClass('nav-current').siblings('.nav-current').removeClass('nav-current');
                } else {
                    var $ul = $(this).siblings('ul');
                    if($ul.length) {
                        $ul.slideToggle(300);
                        $('i.fa', this).toggleClass('fa-angle-down fa-angle-up');
                    }
                }
            });
            //点击子项菜单
            this.$contains.on('click', 'li', function(e, object){
                var title = $(this).data('title'),
                    href = $(this).data('href');
                var $parent = $(this).parent().parent(); //.nav-item

                if(href) {
                    self.$contains.find('li.active, p.active').removeClass('active');
                    $parent.siblings('.nav-current').removeClass('nav-current');

                    self.setIFrameSrc(href, object);
                    self.setNavLocation($(this));
                    $(this).addClass('active');
                    $parent.addClass('nav-current');
                }
            });
        },
        initHtml: function(){
            if(__init) return;
            if(!$.isArray(this.data) || !this.data.length) return;
            var pageId = this.getLocationHashData().I || this.pageData._I;
            var href, dataId;
            var version = this.version;

            if(this.shopInfoData.update_status === 1 && this.shopInfoData.authorizer_appid) { //更新可用
                this.data[this.data.length - 1].children.push({
                    id: '5-11', name: '更新', className: 'color-orange point-red', href: '../../../page/store/shop-update.html'
                });
            }
            this.data.forEach(filterData);
            function filterData(item) {
                if(version && item.href) {
                    item.href += (/\?/.test(item.href) ? '&' : '?') +'v='+ version;
                }
                if(pageId) { //有url参数
                    if(item.id === pageId) {
                        href = item.href;
                        dataId = item.id;
                        item.active = true;
                    } else {
                        if(item.active) item.active = false;
                    }
                } else {
                    if(href) {
                        if(item.active) item.active = false;
                    } else if(item.active) {
                        href = item.href;
                        dataId = item.id;
                        item.active = true;
                    }
                }
                if(item.children) {
                    item.children.forEach(filterData);
                }
            }
            if(!href) {
                var _data = shopBase.findItemInObjectArray(this.data, 'id', '-1');
                if(_data) _data.active = true;
                dataId = '-1';
            }
            this.defaultHref += this.paramVStr;
            this.$iframe.attr('src', href || this.defaultHref);

            var html = template('navTemplate', {listData: this.data});
            if(!$.browser.webkit) {
                this.$contains.find('.main-nav-content').html(html);
            } else {
                this.$contains.addClass('webkit').html(html);
            }
            this.setNavLocation(this.$contains.find('[data-id='+ (dataId || this.defaultId) +']'))
        },
        setIFrameSrc: function (url, object) {
            if(!url || url === '#' || object === false) return;
            var search = '';
            if(!$.isEmptyObject(object)) { //有URL参数
                var parameters = [];
                for(var key in object) parameters.push(key +'='+ object[key]);
                search = parameters.join('&');
                url += (/\?/.test(url) ? '&' : '?') + search;
            }
            app.unblockUI(true); //强制隐藏Loading
            this.$iframe.attr('src', url);
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
        /* 手动触发点击菜单
         * 参数 {}
         * */
        gotoAndClickItem: function(object, isRefresh){
            if($.isEmptyObject(object) || typeof object.id !== 'string') return;
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
        },
        initPage: function () {
            if(__init) return;

            this.initHtml();
            this.initEvents();
            if(!$.browser.webkit) {
                new IScroll('#navWrapper', {
                    scrollbars: 'custom',
                    mouseWheel: true,
                    interactiveScrollbars: true,
                    shrinkScrollbars: 'scale',
                    fadeScrollbars: true
                });
            }

            this.setPage(this.shopInfoData);
            __init = true;
            //Hello!!
        },
        getShopInfoAndSetData: function (callback, isFirst) {
            shopBase.getShopInfo(function (shopInfoData) {
                nav.shopInfoData = shopInfoData;
                if(app.isFunction(callback)) callback(shopInfoData);
                if(!isFirst) nav.setPage(shopInfoData);
            }, true);
        },
        goToPage: function (url) {
            if(url) location.href = url;
        },
        setPage: function (shopInfoData) {
            if(!isPageRightLoaded) return;

            shopInfoData.expired_time = new Date(shopInfoData.expired_time_long).format('yyyy年MM月dd日');
            var isExpired = shopInfoData.current_time_long > shopInfoData.expired_time_long;
            var $expiredText = $('#expiredText');
            if(isExpired) {
                shopInfoData.expired_status_text_2 = '已过期';
                $('#expiredText2').show().siblings('#btnShopBuy').show();
                $expiredText.hide();
            } else {
                var days = (shopInfoData.expired_time_long - shopInfoData.current_time_long) / (60000*60*24);
                if(days <= 7) {
                    shopInfoData.expired_status_text = '即将到期';
                    $expiredText.siblings('#btnShopBuy').show().siblings('#expiredText2').hide();
                } else {
                    shopInfoData.expired_status_text = '有效期';
                }
                $expiredText.show();
            }

            shopBase.setDataBinds(shopInfoData, '#shopInfoBox');

            /* 处理显示页面二维码 */
            setQrCode(shopInfoData);

            /* 处理显示升级 */
            var $shopUpdateBox = $('#shopUpdateBox');
            if(shopInfoData.update_status > 0) {
                if(shopInfoData.update_status === 1) { //升级可用
                    $shopUpdateBox.find('.s-update-before').show().siblings().hide().parent().show();
                } else { //升级中
                    $shopUpdateBox.find('.s-update-content').show().siblings().hide().parent().show();
                }
            } else {
                $shopUpdateBox.find('.s-update-content').hide();
            }

            /*
            * 绑定各事件
            * */
            if(__init) return;
            /*$('#mainUserBox').find('a.user-item-first').attr('href', function () {
                return $(this).attr('href') + nav.paramVStr;
            });*/
            $('#logout').bind('click',function() {
                shopBase.logout();
            });
            $('#btnMainUser').hover(function () {
                $('#mainUserBox').show();
            }, function () {
                $('#mainUserBox').hide();
            });

            $('#btnShopBuy').on('click', function () {
                nav.gotoAndClickItem({id: '5-5'});
            });
            $('#btnBindWx').on('click', function () {
                nav.gotoAndClickItem({id: '5-1'});
            });

            $('#btnUpdate').on('click', function () {
                nav.gotoAndClickItem({id: '5-11'});
            });

            $('#btnShowPageRight, #btnHidePageRight').on('click', function () {
                var $pageRightInsert = $('#pageRightInsert');
                if( !$pageRightInsert.hasClass('-show') ) {
                    $pageRightInsert.addClass('-show').removeClass('-hide');
                } else {
                    $pageRightInsert.addClass('-hide').removeClass('-show');
                }
            });
        },
        backToList: function (text) {
            app.alert({
                content: '<p class="pt-10 pb-10">'+ (typeof text === 'string' ? text : '抱歉，找不到对应的小程序服务，请返回小程序列表') +'</p>',
                callback: function () {
                    location.href = config.getFullPath('page/user/main.html');
                }
            });
        }
    };

    //载入页面右侧HTML
    function getPageRight() {
        if(isPageRightLoaded) return;
        $('#pageRight').load(config.getFullPath('page/store/main-page-right.html'+ nav.paramVStr +' #pageRightInsert'), function(responseTxt, statusTxt){
            if(statusTxt === "success") {
                isPageRightLoaded = true;
                if(nav.shopInfoData) nav.setPage();
            } else if(statusTxt === "error") {
                $(this).text('<p class="content-none">加载失败</p>');
            }
        });
    }
    /*
     * 获取并设置二维码
     * */
    function setQrCode(shopInfoData) {
        var $shopQrCodeBox = $('#shopQrCodeBox');
        var qrCodeUrl;
        if(shopInfoData.is_wx_online) { //已上线
            if(shopInfoData.update_status === 2) { //升级中
                qrCodeUrl = config.getApiPath('merchant/shops/'+ shopInfoData.shop_id +'/weixin/wxaapp/get_qrcode');
            } else { //未升级
                qrCodeUrl = '';
            }
        } else { //未上线
            if(shopInfoData.authorizer_appid) { //已绑定
                qrCodeUrl = config.getApiPath('merchant/shops/'+ shopInfoData.shop_id +'/weixin/wxaapp/get_qrcode');
            } else {}
        }

        if(qrCodeUrl) {
            $shopQrCodeBox.find('img').attr('src', qrCodeUrl);
            $shopQrCodeBox.find('.s-qrc-content').show().siblings().hide();
        } else {
            $shopQrCodeBox.find('.s-qrc-content').hide().siblings().show();
        }


        var $qrCodeImg = $shopQrCodeBox.find('img');

        if(shopInfoData.is_wx_online && shopInfoData.update_status !== 2) { //正式二维码
            $qrCodeImg.attr('src', shopInfoData.wx_online_acode_src_string ).siblings().hide().empty();
            $shopQrCodeBox.find('.s-qrc-content').show().siblings().hide();
            $shopQrCodeBox.find('.s-qrc-text').text('小程序二维码');
        } else { //体验二维码
            if(shopInfoData.authorizer_appid) { //已绑定
                $shopQrCodeBox.find('.s-qrc-content').show().siblings().hide();
                $shopQrCodeBox.find('.s-qrc-text').text('体验码');
                ajax.getAjaxData({
                    url: 'merchant/shops/'+ shopInfoData.shop_id +'/weixin/wxaapp/get_qrcode',
                    success: function (result) {
                        $qrCodeImg.attr('src', 'data:image/png;base64,'+ result.base64).siblings().hide().empty();
                    },
                    error: function () {
                        $qrCodeImg.hide().siblings('span').text('请求二维码失败').show();
                    }
                })
            } else {
                $shopQrCodeBox.find('.s-qrc-content').hide().siblings().show();
            }
        }
    }

    window.nav = nav;
}());