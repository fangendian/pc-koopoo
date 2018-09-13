/**
 * Created by gen on 2017/5/22.
 */
(function () {
    $('#btnLogout').on('click', function () {
        shopBase.logout();
    });



    var pageData = shopBase.getUrlParams();
    var shopInfoData;


    shopBase.getUserInfo(function (data) {
        shopBase.setDataBinds(data);

        if(parseInt(pageData.S)) {
            shopBase.getShopInfo(function (data) {
                shopInfoData = data;
                getTemplates(data);
            }, true);
            $('#mainContainer').children('[data-step=2]').show();
            $('#stepBar').children().eq(1).addClass('active').siblings().removeClass('active');
        } else {
            initCreateMode();
        }
    });



    /*
    * 创建新的小程序模式
    * */
    function initCreateMode() {
        /*
         * 主营商品
         * */
        var commodityCategories = [{ id: 1, name: '服装'}, { id: 2, name: '餐饮美食'}, { id: 3, name: '鲜花'}];
        $('#createBox').show().find('select[name=product_category]').html(
            shopBase.setOptionsHtml(commodityCategories, {
                title: 'name', attributes: { id: 'value' }
            }, '请选择类目')
        );


        /*
         * 联系地址
         * */
        var $locationWrapper = $('#locationWrapper');

        /* 初始化省份 */
        shopBase.getProvinces(function (result) {
            var provinceHtml = shopBase.setOptionsHtml(result, {
                title: 'province_name', attributes: { province_code: 'code', province_id: 'value' }
            }, '选择省');
            $locationWrapper.find('select[name=province_id]').html(provinceHtml);
        });

        $locationWrapper.on('change', 'select[name=province_id]', function () {
            var code = $(':selected', this).data('code');
            var $select = $locationWrapper.find('select[name=city_id]');

            shopBase.getCities(code, function (result) {
                var html = shopBase.setOptionsHtml(result, {
                    title: 'city_name', attributes: { city_code: 'code', city_id: 'value' }
                }, '选择市');
                $select.html(html);
            });
            $locationWrapper.find('select[name=district_id]').html('<option>选择地区</option>');
        });

        $locationWrapper.on('change', 'select[name=city_id]', function () {
            var code = $(':selected', this).data('code');
            var $select = $locationWrapper.find('select[name=district_id]');

            shopBase.getDistricts(code, function (result) {
                var html = shopBase.setOptionsHtml(result, {
                    title: 'district_name', attributes: { district_code: 'code', district_id: 'value' }
                }, '选择区/县');
                $select.html(html);
            });
        });


        /*
         * 提交创建小程序
         * */
        var industryType = pageData.I;
        $('#btnCreate').on('click', function() {
            if($(this).hasClass('disabled')) return;

            var data = shopBase.getAndVerificationData('#createBox', true);
            if(!data) return;

            if(!$('#checkboxAgree')[0].checked) {
                shopBase.showTip('请阅读并同意《担保交易服务协议》', true);
                return;
            }

            data.industry_id = industryType;
            data.product_category = 1;
            ajax.postAjaxData({
                url: 'merchant/shops',
                data: data,
                success: function (data) {
                    shopInfoData = data;
                    $('#stepBar').children().eq(1).addClass('active').siblings().removeClass('active');
                    $('.main-box[data-step=2]').show().siblings('.main-box').hide();
                    getTemplates(data);
                }
            });

        });
    }



    /*
    * 选择模板
    * */
    var hasTemplate = false;
    var templateId;
    function getTemplates(createData) {
        if(hasTemplate || !createData) return;
        ajax.getAjaxData({
            url: '/merchant/sysindustrys/'+ createData.industry_id +'/template',
            pageSize: 6,
            success: function (data) {
                hasTemplate = true;
                data.__template_id = parseInt(pageData.T);
                $('#templateUl').html(template('templateTemplate', data));
            }
        });

        if(shopInfoData.authorizer_appid) { //已绑定过
            shopBase.goToShopById(shopInfoData.shop_id);
        }
    }


    var templatePath = '../../stores/';
    var templatesData = [{
        id: 1, templatePath: templatePath +'mall/images/',
        images: ['t1_home.jpg', 't1_products.jpg', 't1_cart.jpg', 't1_orders.jpg']
    },{
        id: 2, templatePath: templatePath +'mall/images/',
        images: ['t2_home.jpg', 't2_cart.jpg', 't2_orders.jpg']
    },{
        id: 3, templatePath: templatePath +'cate/images/',
        images: ['t_home.jpg', 't_list.jpg', 't_my.jpg']
    },{
        id: 4, templatePath: templatePath +'hairdressing/images/',
        images: ['t_home.jpg', 't_list.jpg', 't_my.jpg']
    },{
        id: 5, templatePath: templatePath +'education/images/',
        images: ['t_home.jpg', 't_list.jpg', 't_my.jpg']
    }];

    
    var $templateCarousel = $('#templateCarousel');
    $('#templateUl').on('click', '.template-btn', function () {
        if($(this).hasClass('active')) return;

        $(this).getParentByTagName('li').addClass('active').siblings('.active').removeClass('active').find('.template-btn').text('选择');
        $(this).text('已选择');
        $('#btnChoose').removeAttr('disabled');
    }).on('click', '.template-view', function () {
        var $li = $(this).getParentByTagName('li');
        var id = $li.data('id');

        var __data = shopBase.findItemInObjectArray(templatesData, 'id', id);
        if(!__data) return;

        $templateCarousel.children('.carousel-inner').html(template('innerTemplate', __data));
        $templateCarousel.children('.carousel-indicators').html(template('indicatorsTemplate', __data));
        $templateCarousel.parent().fadeIn();
        $templateCarousel.carousel({
            interval: 3000
        });
    });
    
    $templateCarousel.siblings('.template-slide-bg').on('click', function () {
        $templateCarousel.carousel('pause').parent().hide();
    });
    



    //提交选择模板
    $('#btnChoose').on('click', function() {
        templateId = $('#templateUl').find('li.active').data('id');
        if(!templateId) {
            app.show({
                content: '请先选择模板！', type: 3
            });
            return;
        }
        if(shopInfoData) {
            var data = $.extend({}, shopInfoData, {template_id: templateId});

            var $button = $(this).attr('disabled', 'disabled');
            ajax.putAjaxData({
                url: 'merchant/shops/'+ data.shop_id,
                data: data,
                success: function () {
                    sessionStorage.removeItem(config.lsk_shop_info);
                    $('#stepBar').children().eq(2).addClass('active').siblings().removeClass('active');
                    $('.main-box[data-step=3]').show().siblings('.main-box').hide();

                    ajax.getAjaxData({
                        url: 'merchant/shops/'+ shopInfoData.shop_id +'/bind/weixin/url',
                        success: function (result) {
                            $('#btnSetup').attr('href', result.url).removeClass('disabled');
                        }
                    })
                },
                complete: function () {
                    $button.removeAttr('disabled');
                }
            });
        }
    });


    /*
    * 完成，引导绑定小程序授权
    * */
    $('#btnSetup').on('click', function () {
        if($(this).attr('disabled')) return;
        app.confirm({
            content: '<div class="pt-5 pb-15">是否授权成功？</div>',
            otherButtons: ['否', '成功'],
            okCallback: function () {
                goToStoreManage(shopInfoData.shop_id, templateId, {_I: '5-1'});
            },
            cancelCallback: function () {
                location.href = 'shop-list.html';
            }
        });
    });
    
    $('#btnDone').on('click', function () {
        goToStoreManage(shopInfoData.shop_id, templateId, {_I: '5-1'});
    });


    function goToStoreManage(shopId, templateId, params) {
        if(!templateId) return;
        shopBase.getTemplateConfig(function(storesData) {
            var data = shopBase.findItemInObjectArray(storesData, 'id', templateId);
            if(data) {
                data.shopId = shopId;
                shopBase.goToShopById(data, params);
            } else {
                app.alert({
                    content: '抱歉，找不到对应的小程序服务！'
                })
            }
        })
    }

}());