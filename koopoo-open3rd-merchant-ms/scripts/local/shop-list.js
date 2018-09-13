/**
 * Created by gen on 2017/5/22.
 */
(function(){
    $('#btnLogout').on('click', function () {
        shopBase.logout();
    });


    var industryTypes = {1: '微商城', 2:'零售', 3:'餐饮', 4:'美业', 5:'教育培训'};
    shopBase.getUserInfo(function (data) {
        shopBase.setDataBinds(data);
        $('#btnCreate').removeAttr('disabled');

        ajax.getAjaxData({
            url: 'merchant/shops/list',
            data: {
                pageSize: 1000,
                is_deleted: false
            },
            success: function(data){
                data.result.forEach(function (item) {
                    item.authorizer_text = !!item.authorizer_appid ? '已认证' : '未认证';
                    item.expired_date = new Date(item.expired_time_long).format('yyyy年MM月dd HH:mm');
                    item.industry_text = industryTypes[item.industry_id] || '未知';
                });
                $('#shopListUl').html(template('shopListTemplate', data));
                if(data.result.length) {
                    $('#btnChoose').removeAttr('disabled');
                }
            },
            error: function () {
                $('#shopListUl').html();
            }
        });
    });

    $('#btnCreate').on('click', function () {
        location.href = 'shop-type-choose.html';
    });



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

    function goToStoreManage(shopId, templateId, params) {
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