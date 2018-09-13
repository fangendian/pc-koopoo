/**
 * Created by gen on 2017/5/25.
 */
(function () {
    var shopInfoData;
    var idStrHeaderBar = '#headerBar',
        idStrBindWxBox = '#bindWxBox',
        idStrAuditBox = '#auditBox',
        idStrPublicBox = '#publicBox';

    $(idStrHeaderBar).on('click', 'p', function () {
        if($(this).hasClass('disabled') || $(this).hasClass('active')) return;

        $(this).addClass('active').siblings().removeClass('active');
        $('#'+ $(this).data('bar')).show().siblings().hide();
    });


    /*
    * 获取商户信息
    * */
    getShopInfo(true);
    function getShopInfo(reload) {
        shopBase.getShopInfo(function (data) {
            shopInfoData = data;
            initPage();
        }, reload);
    }
    /*
    * 初始化页面
    * */
    function initPage() {
        var idName;
        if(!shopInfoData.authorizer_appid) {
            idName = idStrBindWxBox; //绑定小程序

            $(idStrBindWxBox).children('.box-content').show().siblings().hide();
            $(idStrAuditBox).children('.box-before').show().siblings().hide();
            $(idStrPublicBox).children('.box-before').show().siblings().hide();

            $('#btnBindWx').on('click', function () {
                top.nav.gotoAndClickItem({id: '5-1'})
            });

            $(idName).show();
        } else {
            idName = idStrAuditBox;
            $(idStrBindWxBox).children('.box-result').show().siblings().hide();

            if(shopInfoData.audit_id) { //已提交过
                if(shopInfoData.is_wx_online) { //已上线
                    var isVisible = shopInfoData.wx_visitstatus === 'open';
                    if(isVisible) { //当前为可见
                        $(idStrPublicBox).children('.box-visible').show().siblings().hide();
                    } else {
                        $(idStrPublicBox).children('.box-result').show().siblings().hide();
                    }
                    $(idStrPublicBox).children('.box-visible').html(template('visibleResultTemplate', {status: isVisible ? 0 : 1})).show().siblings().hide();

                    //判断是否更新中!
                    if(shopInfoData.update_status === 2) { //更新升级中..
                        setAuditStatus('更新');
                    } else {
                        //未升级，显示发布上线模块
                        idName = idStrPublicBox;
                        $(idStrAuditBox).children('.box-result').html(template('auditResultTemplate', {status: 0})).show().siblings().hide();
                        $(idStrHeaderBar).children().removeClass('disabled active');
                        $(idStrHeaderBar).children('[data-bar='+ idName.replace(/#/, '') +']').addClass('active');
                        $(idName).show();
                    }
                } else { //未上线
                    setAuditStatus();
                }
            } else { //未提交审核
                $(idStrAuditBox).children('.box-content').show().siblings().hide();
                $(idStrPublicBox).children('.box-before').show().siblings().hide();
                $(idStrHeaderBar).children('[data-bar='+ idName.replace(/#/, '') +']').removeClass('disabled').addClass('active');
                $(idName).show();
            }
        }

        //处理审核的状态
        function setAuditStatus(isUpdate) {
            isAudit(function (data) {
                if(parseInt(data.status) === 0) { //已审核通过
                    if(isUpdate || !shopInfoData.is_wx_online) { //更新后审核通过，或第一次审核通过
                        $(idStrPublicBox).children('.box-content').show().siblings().hide(); //可以发布了
                    }
                    //通过审核，显示发布上线
                    idName = idStrPublicBox;
                    $(idStrHeaderBar).children().removeClass('disabled active');
                    $(idStrHeaderBar).children('[data-bar='+ idName.replace(/#/, '') +']').addClass('active');
                } else { //审核未通过
                    $(idStrHeaderBar).children('[data-bar=auditBox]').removeClass('disabled').addClass('active');
                    $(idStrPublicBox).children('.box-before').show().siblings().hide();
                }
                $(idStrAuditBox).children('.box-result').html(template('auditResultTemplate', data)).show().siblings().hide();

                $(idName).show();
            }, function () { //请求失败
                $(idStrPublicBox).children('.box-before').show().siblings().hide();
            });
        }

        $(idStrHeaderBar).children('[data-bar='+ idName.replace(/#/, '') +']').addClass('active');
    }

    /* 查看体验码 */
    $('#wxQrCodeModal').on('show.bs.modal', function () {
        var $qrCodeImg = $('#qrcodeImg');
        if(!$qrCodeImg.attr('src')) {
            ajax.getAjaxData({
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/weixin/wxaapp/get_qrcode',
                success: function (result) {
                    $qrCodeImg.attr('src', 'data:image/png;base64,'+ result.base64).show().siblings().hide();
                },
                error: function () {
                    $qrCodeImg.hide().siblings('span').text('请求二维码失败').show();
                }
            });
        }
    });


    //审核的状态
    function isAudit(callback, errorCallback) {
        ajax.getAjaxData({
            url: 'merchant/shops/'+ shopInfoData.shop_id +'/weixin/wxaapp/get_auditstatus',
            success: callback,
            error: errorCallback
        });
    }

    //准备提交审核
    function postAudit() {
        app.confirm({
            title: '确定提交审核吗？',
            content: '提交之前，建议多次预览小程序确保内容已完善，这将提高审核通过率。',
            callback: function () {
                ajax.postAjaxData({
                    url: 'merchant/shops/'+ shopInfoData.shop_id +'/weixin/wxaapp/submit_audit',
                    success: function () {
                        getShopInfo(true);
                    }
                })
            }
        });
    }

    //提交审核
    $('#btnAudit').on('click', postAudit);

    //再次提交审核
    $('#auditBoxResult').on('click', '#btnAuditAgain', postAudit);

    /* 发布上线 */
    $('#btnPublic').on('click', function () {
        ajax.postAjaxData({
            url: 'merchant/shops/'+ shopInfoData.shop_id +'/weixin/wxaapp/release',
            success: function () {
                // getShopInfo(true);
                top.nav.getShopInfoAndSetData(function (data) {
                    shopInfoData = data;
                    initPage();
                });
            }
        })
    });


    $('#btnVisible').on('click', function () {
        changeVisible(true, '确定更改为可见吗？', '更改后，用户将能够发现小程序并且使用。');
    });
    $('#visibleBoxResult').on('click', '.btn-visible-close', function () {
        changeVisible(false);
    }).on('click', '.btn-visible-open', function () {
        changeVisible(true);
    });

    function changeVisible(visible, title, content) { //更改
        app.confirm({
            title: title || '确定更改为不可见吗？',
            content: content || '更改后，用户将不能够发现小程序。',
            callback: function () {
                ajax.putAjaxData({
                    url: 'merchant/shops/'+ shopInfoData.shop_id +'/weixin/wxaapp/change_visitstatus',
                    data: {
                        action: visible ? 'open' : 'close'
                    },
                    success: function () {
                        getShopInfo(true);
                    }
                })
            }
        });
    }

}());