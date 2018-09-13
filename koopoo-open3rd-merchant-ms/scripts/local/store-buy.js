/**
 * Created by gen on 2017/5/27.
 */

shopBase.getShopInfo(function (shopData) {

    function showData(data) {
        var isExpired = data.current_time_long > data.expired_time_long;
        var lastTimeLong = isExpired ? new Date().getTime() : data.expired_time_long;

        data.expired_time = new Date(data.expired_time_long).format('yyyy年MM月dd日');
        data.expired_status_text = isExpired ? '已过期' : '';
        if(data.expired_status_text) {
            $('#expiredText').show();
        }
        shopBase.setDataBinds(data);
        $('#newTime').text( new Date(lastTimeLong + (365 * 1000*60*60*24)).format('yyyy年MM月dd日') );

        //购买记录
        ajax.getAjaxData({
            url: 'merchant/shops/'+ shopData.shop_id +'/sysorders/list',
            success: function (data) {
                data.result.forEach(function (item) {
                    item.create_time = new Date(item.create_time_long).format('yyyy年MM月dd日');
                });
                $('#buyListUl').html(template('buyListTemplate', data));
            }
        });
    }


    showData(shopData);

    var $shopBuyBox = $('#shopBuyBox');
    var currentOrder; //当前的订单
    var payType;



    $('#payMethodUl').on('click', 'li', function () {
        payType = $(this).data('type');

        $(this).addClass('active').siblings().removeClass('active');
        $('#btnPayNext').removeAttr('disabled');
    });



    $('#shopBuyModal').on('show.bs.modal', function () {
        payType = '';
        $shopBuyBox.find('.pay-type-content-box').hide().children().hide();
        $shopBuyBox.find('.pay-type-choose-box').show().find('.pay-method-item.active').removeClass('active');
    });
    

    //点击下一步，隐藏支付方式模块
    $('#btnPayNext').on('click', function () {
        if(payType == 'wxpay') {
            getQrCodeOfWxPay();
        } else {
            $shopBuyBox.find('.pay-type-choose-box').hide();
            $shopBuyBox.find('[data-mode='+ payType +']').show().siblings().hide().parent().show();
        }
    });
    
    //返回选择支付
    $shopBuyBox.on('click', '.btn-back', function () {
        $shopBuyBox.find('.pay-type-choose-box').show().siblings('.pay-type-content-box').hide();
    });


    /*
    * 创建订单
    * */
    function createOrder(callback) {
        if(!app.isFunction(callback)) return;
        if(!currentOrder) {
            ajax.postAjaxData({
                url: 'merchant/shops/'+ shopData.shop_id +'/sysorders',
                success: function (data) {
                    currentOrder = data;
                    callback(data);
                }
            })
        } else {
            callback(currentOrder);
        }
    }


    /*
    * 微信支付
    * */
    var wxCodeUrl;
    function getQrCodeOfWxPay() {
        if(wxCodeUrl) return;
        createOrder(function (data) {
            ajax.postAjaxData({
                url: 'merchant/shops/'+ shopData.shop_id +'/sysorders/'+ data.sys_order_id +'/pay/wechat',
                success: function (data) {
                    wxCodeUrl = data.code_url;
                    $('#wxQrCodeImg').qrcode({width: 150, height:150, text: data.code_url});

                    $shopBuyBox.find('.pay-type-choose-box').hide();
                    $shopBuyBox.find('[data-mode='+ payType +']').show().siblings().hide().parent().show();
                }
            })
        })
    }

    $('#btnPayWxComplete').on('click', function () {
        currentOrder = null;
        $('#shopBuyModal').modal('hide');
        getShopInfo();
    });

    /*
    * 票券码支付
    * */
    $('#btnSetPay').on('click', function () {
        var __data = shopBase.getAndVerificationData($shopBuyBox.find('div[data-mode=code]'));
        if(!__data) return;

        createOrder(function (orderData) {
            ajax.postAjaxData({
                url: 'merchant/shops/'+ shopData.shop_id +'/sysorders/'+ orderData.sys_order_id +'/pay/ticket_code',
                data: __data,
                success: function () {
                    getShopInfo();
                    currentOrder = null;
                    $('#shopBuyModal').modal('hide');
                }
            })
        })
    });
    
    
    function getShopInfo() {
        shopBase.getShopInfo(function (data) {
            showData(data);
            shopData = data;
            if(top.shopBase) {
                top.shopBase.setDataBinds(data);
            }
        }, true);
    }

}, false);