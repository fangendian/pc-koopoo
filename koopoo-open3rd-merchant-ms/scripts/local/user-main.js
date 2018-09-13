/**
 * Created by gen on 2017/5/22.
 */
var baseQueryUrl = config.api_path_top + config.api_path; //查询模板数据
$('#btnLogout').on('click', function () {
    shopBase.logout();
});

$('[data-toggle="tooltip"]').tooltip();

shopBase.getUserInfo(function(userInfoData){
    shopBase.setDataBinds(userInfoData, '#header,#pageLeft');


    /*
     * 我的小程序
     * */
    $('.btnCreate').removeAttr('disabled').on('click', function () {
    	$('#tabStore').trigger('click');
    	//TODO 判断是否创建互赏
        var createHeka = $(this).hasClass('create-heka');
        var createPoker = $(this).hasClass('create-poker');

    	if(createHeka || createPoker){
            ajax.getAjaxData({
                url: '/merchant/systemplates/list',
                data: {is_deleted: false,pageSize:30},
                success: function(res){
                    if(res.result.length<=0){
                        app.show({ type: 1, content: '模板获取异常，请稍后重试！'});
                        return;
                    }
                    var template_id = createHeka ? 25 : 26;
                    var __data = shopBase.findItemInObjectArray(res.result, 'template_id', template_id);
                    if(__data) {
                        templateId = __data.template_id;
                        shopHekaData.template_id = templateId;
                        showCreate(__data);
                    }
                },
                error: function(e){
                    app.show({ type: 1, content: '模板获取异常，请稍后重试！'});
                }
            });
    	}
    });

    var myShopsData;
    var isTest = shopBase.isTest;
    getMyShops();

    /*
     * 准备进入小程序
     * */
    $('#shopListUl').on('click', 'li', function () {
        var templateId = $(this).data('t-id'),
            shopId = $(this).data('id'),
            appId = $(this).data('a-id');
        if(!templateId) {
            sessionStorage.setItem(config.lsk_shop_id, shopId);
            location.href = 'shop-create.html'+ shopBase.parseObjectToUrlParams({S: shopId, I: $(this).data('i-id')});
        } else {
            var params = null;
            if(!appId) params = {_I: '5-1'}; //先绑定
            goToStoreManage(shopId, templateId, params);
        }
    }).on('click', '.mc-btn-text', function (e) {
        e.stopPropagation();
        var $li = $(this).getParentByTagName('li'),
            templateId = $li.data('t-id'),
            shopId = $li.data('id');
        if($(this).hasClass('btn-edit')) {
            if(!templateId) {
                sessionStorage.setItem(config.lsk_shop_id, shopId);
                location.href = 'shop-create.html'+ shopBase.parseObjectToUrlParams({S: shopId, I: $li.data('i-id')});
            } else {
                goToStoreManage(shopId, templateId, {_I: '5-1'});
            }
        } else { //delete
            app.confirm({
                content: '<p class="pt-10 pb-10">确定要删除小程序 "<strong>'+ $li.find('.shop-name').text() +'</strong>" 吗？</p>',
                otherButtons: ['取消', '删除'],
                otherButtonStyles: ['btn-default', 'btn-danger'],
                callback: function () {
                    ajax.deleteAjaxData({
                        url: 'merchant/shops/'+ shopId,
                        success: function () {
                            shopBase.showTip('删除成功!');
                            $li.transition({
                                'transform': 'scale(0,0)', opacity: 0
                            }, 300 , 'ease', function () {
                                $li.remove();
                            });
                        }
                    })
                }
            });
        }
    });

    function getMyShops() {
        ajax.getAjaxData({
            url: 'merchant/shops/list',
            data: {
                pageSize: 1000,
                is_deleted: false
            },
            success: function (data) {
                if(!myShopsData) {
                    shopBase.getTemplateConfig(function(storesData) {
                        myShopsData = storesData;
                        setAndShowData();
                    }, function (err) {
                        setAndShowData();
                    });
                } else {
                    setAndShowData();
                }

                function setAndShowData() {
                    data.result.forEach(function (item) {
                        item.authorizer_text = !!item.authorizer_appid ? '已绑定' : '<span class="color-orange">未绑定</span>';
                        item.expired_date = new Date(item.expired_time_long).format('yyyy年MM月dd日 HH:mm');
                        item.expired_text = item.expired_time_long < item.current_time_long ? '<span class="color-red">已过期</span>' : '';

                        var data = shopBase.findItemInObjectArray(myShopsData, 'id', item.template_id);
                        if(data) {
                            item.color = data.color;
                            if(isTest) item.template_name = data.nickname;
                        }
                    });
                    $('#shopListUl').html( template('shopListTemplate', data) );
                }
            },
            error: function () {
                $('#shopListUl').html( '<p>抱歉，请求失败！</p>' );
            }
        });
    }

    //匹配进入对应的管理区
    function goToStoreManage(shopId, templateId, params) {
        var data = shopBase.findItemInObjectArray(myShopsData, 'id', templateId);
        if(data) {
            data.shopId = shopId;
            shopBase.goToShopById(data, params);
        } else {
            app.alert({
                content: '抱歉，找不到对应的小程序服务！'
            })
        }
    }




    /*
    * 模板分类
    * */
    var categoriesData;
    var templatesData=[]; //当前模板数据
    var templatesDetailData = []; //已加载过的模板详细数据
    var industryId = 1; //默认
    var templateId;

    var shopInfoData; //当前小程序的临时数据
    var shopHekaData = {}; //贺卡模板店铺临时数据: template_id , logoImg

    //初始化模板分页
    var allUrl = '/merchant/systemplates/list';
    //TODO 模板排序
    var __requestData = { is_deleted: false,sortColumns: 'template_id desc' };
    var pageLoader;
    
    // 如果在编辑互赏模板，切换tab时要按下取消  v2.0
	$('#tabMyprogram').on('show.bs.tab', function() {
		if($('#createContainer').is(":visible")){
			$('#btnCreateCancel').trigger('click');
		}
	})
	
    //显示模板列表时加载数据
    $('#tabStore').on('show.bs.tab', function() {
        if(!pageLoader) {
            ajax.getAjaxData({
                url: '/merchant/sysindustrys/list',
                data: {
                    is_deleted: false
                },
                success: function (data) {
                    categoriesData = data;
                    $('#categoriesUl').html( template('categoriesTemplate', data) );
                }
            });

            pageLoader = new PagesLoader({
                url: allUrl,
                pageBarIdString: '#pageNav',
                showWay: 2, //分页导航展示模式
                data: __requestData,
                autoLoad: true,
                success: function (data) {
//                  templatesData = data.result;
                    data.result.forEach(function(item,index){
                    	templatesData.push(item)
                    })
                    $('#templateUl').append( template('storeListTemplate', data) );
                }
            });
        }
    });


    /*
    * 点击模板分类
    * */
    $('#categoriesUl').on('click', 'li', function () {
        if($(this).hasClass('active')) return;

        var id = $(this).data('id');
        var url;
        var data = $.extend({}, __requestData);
        if(id) {
            data.industry_id = id;
            url = '/merchant/sysindustrys/'+ id +'/template';
            industryId = id;
        } else {
            url = allUrl;
            industryId = 1; //默认
        }
        $('#templateUl').empty();
        pageLoader.resetThenRequest(data, url);

        $(this).addClass('active').siblings().removeClass('active');
    });


    /*
     * 浏览图片 & 准备创建小程序
     * */
    var $templateCarousel = $('#templateCarousel');
    $('#templateUl').on('click', '.btn', function () {
        var $li = $(this).getParentByTagName('li');
        var id = $li.data('id');

        if($(this).hasClass('btn-view')) {
            getTemplateDetails(id, function (data) {
                if(data.imgs.length) {
                    $templateCarousel.children('.carousel-inner').html(template('innerTemplate', data));
                    $templateCarousel.children('.carousel-indicators').html(template('indicatorsTemplate', data));
                    $templateCarousel.parent().fadeIn();
                    $templateCarousel.carousel({
                        interval: 3000
                    });
                } else {
                    shopBase.showTip('暂无图片', true);
                }
            });
        } else {
            //TODO 创建小程序
            var __data = shopBase.findItemInObjectArray(templatesData, 'template_id', id);
            if(__data) {
                templateId = __data.template_id;
                shopHekaData.template_id = templateId;
                showCreate(__data);
            } else {
                app.show({
                    type: 3, content: '请求失败，请刷新重试！'
                })
            }
        }
    });

    $templateCarousel.siblings('.template-slide-bg').on('click', function () {
        $templateCarousel.carousel('pause').parent().hide();
    });

    function getTemplateDetails(id, callback){
        var __data = shopBase.findItemInObjectArray(templatesDetailData, 'template_id', id);
        if(!__data) {
            ajax.getAjaxData({
                url: '/merchant/systemplates/'+ id,
                success: function (data) {
                    templatesDetailData.push(data);
                    callback(data);
                }
            })
        } else {
            callback(__data);
        }
    }



    /*
    * 创建小程序
    * */
    var $createContainer = $('#createContainer');
    var $createContent = $('.create-content');
    var $locationWrapper = $createContainer.find('#locationWrapper');

    function showCreate(templateData) {
    	// TODO 创建互赏&翻牌红包模板
    	// 使用贺卡模板时，预览方式不同 v2.0
    	$createContainer.children('.create-form').show();
		if(templateData.template_id == 25){
			$createContainer.find('.create-template').hide();
            $createContainer.find('.create-template-poker').hide();

			$createContent.children('.form-upload-Logo').show();
        	$createContainer.find('.create-template-heka').show();
//			shopBase.setDataBinds(templateData, $createContainer.find('.create-template'));
		} else if(templateData.template_id == 26){
            $createContainer.find('.create-template').hide();
            $createContainer.find('.create-template-heka').hide();

            $createContent.children('.form-upload-Logo').show();
            $createContainer.find('.create-template-poker').show();
//			shopBase.setDataBinds(templateData, $createContainer.find('.create-template'));
        }else{
			$createContent.children('.form-upload-Logo').hide();
        	$createContainer.find('.create-template-heka').hide();
        	$createContainer.find('.create-template-poker').hide();

			$createContainer.find('.create-template').show();
			shopBase.setDataBinds(templateData, $createContainer.find('.create-template'));
		}
		$createContainer.show().siblings().hide();
		
          //TODO 上传小程序Logo
	    shopBase.initFileUpload({
            fileInputId: '#fileUploadImage',
            maxFileSize: 1024 * 1024,
            url: config.getHekaFullPath() + 'AuthorzerInfo/shopLog',
            success: function (result) {
                var imgSrc = result.data.url;
                if (!imgSrc) {
                    shopBase.showTip('上传失败，请稍后重试!', true);
                    return
                }
                shopBase.showTip('上传完成!');
                // 保存logo地址
                shopHekaData.logoImg = imgSrc;
                $('#logoPreview').attr('src',imgSrc);
                $('#logoPokerPreview').attr('src',imgSrc);
            }
        });

        //获取地址数据
        shopBase.getProvinces(function (result) {
            var provinceHtml = shopBase.setOptionsHtml(result, {
                title: 'province_name', attributes: { province_code: 'code', province_id: 'value' }
            }, '请选择省');
            $locationWrapper.find('select[name=province_id]').html(provinceHtml);
        });
        
    }
	
	/*
	 * 上传Logo
	 **/
	$('#btnUploadLogo').on('click',function(){
        if($(this).hasClass('disabled')) return;
		//上传封面
        $('#fileUploadImage').trigger('click');
	})

    function hideCreate() {
        $createContainer.children('.create-complete').hide();
        $createContainer.hide().siblings().show();
        $createContainer.find('input').val('');
    }

    /*
     * TODO 提交创建小程序
     * */
    $('#btnCreateSubmit').on('click', function() {
        if($(this).hasClass('disabled')) return;

        var data = shopBase.getAndVerificationData($createContainer.children('.create-form'), true);
        if(!data) return;

        if(!shopHekaData.logoImg && (shopHekaData.template_id===25 || shopHekaData.template_id===26)){
            shopBase.showTip('请上传小程序logo', true);
            return;
        }

        if(!$('#checkboxAgree')[0].checked) {
            shopBase.showTip('请阅读并同意《担保交易服务协议》', true);
            return;
        }

        data.industry_id = industryId;
        data.product_category = 1;
        data.template_id = templateId;
        data.logo_img = shopHekaData.logoImg;
        ajax.postAjaxData({
            url: 'merchant/shops',
            data: data,
            success: function (data) {
                shopInfoData = data;
                sessionStorage.removeItem(config.lsk_shop_info);
                // TODO 保存Logo
                if(shopInfoData.template_id==25 || shopInfoData.template_id==26){
                    ajax.postAjaxData({
                        url: config.getHekaFullPath() + '/AuthorzerInfo/savelog',
                        data:{
                            logUrl:shopHekaData.logoImg,
                            shopId:shopInfoData.shop_id,
                        },
                        success: function (res) {
                            if(res.code===0){
                                afterCreate();
                            }else{
                                shopBase.showTip('Logo保存失败',true);
                            }
                        }
                    });
                }else{
                    afterCreate();
                }

            }
        });

    });

    function afterCreate(){
        getMyShops(); //重新请求我的小程序
        $createContainer.children('.create-complete').show().siblings('.create-form').hide();
        ajax.getAjaxData({
            url: 'merchant/shops/'+ shopInfoData.shop_id +'/bind/weixin/url',
            success: function (result) {
                $('#btnSetup').attr('href', result.url).removeClass('disabled');
                shopHekaData.logoImg = null;
                $('#logoPreview').attr('src','../../images/logo-heka.png');
            }
        })
    }

    //取消创建
    $('#btnCreateClose, #btnCreateCancel').click(function () {
        hideCreate();
    });


    /*
     * 联系地址
     * */
    $locationWrapper.on('change', 'select[name=province_id]', function () {
        var code = $(':selected', this).data('code');
        var $select = $locationWrapper.find('select[name=city_id]');

        shopBase.getCities(code, function (result) {
            var html = shopBase.setOptionsHtml(result, {
                title: 'city_name', attributes: { city_code: 'code', city_id: 'value' }
            }, '请选择市');
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
            }, '请选择区/县');
            $select.html(html);
        });
    });


    /*
     * 完成，引导绑定小程序授权
     * */
    $('#btnSetup').on('click', function () {
        if($(this).attr('disabled')) return;
        app.confirm({
            content: '<div class="pt-5 pb-15">是否授权成功？</div>',
            otherButtons: ['否', '成功'],
            callback: function () {
                goToStoreManage(shopInfoData.shop_id, templateId, {_I: '5-1'});
            },
            cancelCallback: function () {
                getMyShops();
                hideCreate();
            }
        });
    });

    $('#btnDone').on('click', function () {
        goToStoreManage(shopInfoData.shop_id, templateId, {_I: '5-1'});
    });

});