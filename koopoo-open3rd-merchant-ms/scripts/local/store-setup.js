/**
 * Created by gen on 2017/5/25.
 */
(function () {
	
    var shopInfoData;
    var bindWxData;
    var idStrHeaderBar = '#headerBar',
        idStrBindWxBox = '#bindWxBox',
        idStrSetPayBox = '#setPayBox',
        idStrManageUserBox = '#manageUserBox',
        idStrViewBox = '#viewBox';

    var defaultImageUrl = config.getDefImgUrl();

	// 提现手续费修改
	$('[data-toggle="tooltip"]').tooltip();
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
            $('#contentContainer').show().siblings('#errorContainer').show();
            initPage();
        }, reload, function () {
            $('#errorContainer').show().siblings('#contentContainer').show();
        });
    }
    /*
    * 初始化页面
    * */
    function initPage() {
        var idName; 
        if(!shopInfoData.authorizer_appid) { //绑定小程序
            if(!bindWxData) {
                ajax.getAjaxData({
                    url: 'merchant/shops/'+ shopInfoData.shop_id +'/bind/weixin/url',
                    success: function (result) {
                        bindWxData = result;
                        $('#btnBindWx').attr({'href': result.url, 'target': '_blank'}).removeAttr('disabled');
                    }
                });
                $('#btnBindWx').on('click', function () {
                    if($(this).attr('disabled')) return;
                    app.confirm({
                        content: '是否授权成功？',
                        otherButtons: ['否', '成功'],
                        callback: function () {
                            getManager(function () {
                                top.nav.getShopInfoAndSetData();
                                location.reload();
                            });
                        },
                        cancelCallback: getManager
                    })
                });
            }

            $(idStrBindWxBox).show().children('.box-content').show().siblings().hide();
            $(idStrHeaderBar).children('[data-bar='+ idStrBindWxBox.replace(/#/, '') +']').addClass('active');
        } else {
            $(idStrBindWxBox).children('.box-result').show().siblings().hide();
	    
	    $('#alertWarning').show().find('.btn-tomyapp').on('click', function () {
                top.nav.goToPage(config.base_path + 'page/user/main.html');
            });
	    
            //TODO 上传商户证书
            shopBase.initFileUpload({
                fileInputId: '#fileUploadImage',
                maxFileSize: 1024 * 1024,
                url: config.getHekaFullPath() + "/unpackFile/unpackZipFile",
                fileType: 'zip',
                success: function (result) {
                    // 保存logo地址
                    shopBase.showTip('证书上传完成');
                }
            });
            //上传素材时，添加额外参数
            $('#fileUploadImage').bind('fileuploadsubmit', function (e, data) {
                data.formData = {
                    shopId: shopInfoData.shop_id
                };
            });
            $("#uploadCertFile").click(function () {
                $('#fileUploadImage').trigger('click');
            });

            //查看互赏模板是否填写支付信息
            getAuthorizeInfo(function (data) {
                if(!data.mch_id) {
                	// 不是互赏或翻牌红包模板
                	if(!(shopInfoData.template_id == 25 || shopInfoData.template_id == 26)){
                  		idName = idStrSetPayBox;
                  		$(idName).show();
                  		$(idStrSetPayBox).children('.box-before').show().siblings().hide();
	                    $(idStrHeaderBar).children('[data-bar='+ idName.replace(/#/, '') +']').addClass('active');
	                    $(idStrHeaderBar).children().removeClass('disabled');
                		return
                	}
                    ajax.postAjaxData({
                        url: config.getHekaFullPath() + '/AuthorzerInfo/getShopInfo',
                        data:{ shopId:shopInfoData.shop_id },
                        success: function (data) {
                            if((!data.data)||!data.data.appId){
                                idName = idStrSetPayBox;
                                $(idStrSetPayBox).children('.box-before').show().siblings().hide();
                            }else{
                                idName = idStrViewBox;
                                $(idStrSetPayBox).children('.box-content').show().siblings().hide();
                                $('#heka-shopid').text(data.data.appId);
                            }
                            $(idName).show();
                            $(idStrHeaderBar).children('[data-bar='+ idName.replace(/#/, '') +']').addClass('active');
                            $(idStrHeaderBar).children().removeClass('disabled');
                        }
                    })

                }
                else {
                    idName = idStrViewBox;
                    $(idStrSetPayBox).children('.box-content').show().siblings().hide();
                    $(idName).show();
                    $(idStrHeaderBar).children('[data-bar='+ idName.replace(/#/, '') +']').addClass('active');
                    $(idStrHeaderBar).children().removeClass('disabled');
                }
                // $(idName).show();
                // $(idStrHeaderBar).children('[data-bar='+ idName.replace(/#/, '') +']').addClass('active');
                // $(idStrHeaderBar).children().removeClass('disabled');
            });

            //处理管理体验者
            if(shopInfoData.is_wx_online && shopInfoData.update_status !== 2) { //已上线
                $(idStrManageUserBox).find('.box-result').show().siblings().hide();
            } else {
                $(idStrManageUserBox).find('.box-content').show().siblings().hide();
            }

            //处理二维码
            setQrCode();
            //TODO 显示heka模板配置
            if(shopInfoData.template_id ===25 || shopInfoData.template_id ===26 ){
                $('.heka-hidden').remove()
            }else{
                $('.heka-show').remove()
            }

        }
    }

    function getManager(callback) {
        ajax.putAjaxData({
            url: 'merchant/shops/'+ shopInfoData.shop_id +'/manager',
            success: function () {
                sessionStorage.removeItem(config.lsk_shop_info);
                if(callback instanceof Function) callback();
            }
        });
    }

    //查看授权资料
    function getAuthorizeInfo(callback) {
        ajax.getAjaxData({
            url: 'merchant/shops/'+ shopInfoData.shop_id +'/weixin/wxaapp/authorizerinfo',
            success: function (data) {
                if(!data.head_img_src_string) data.head_img_src_string = defaultImageUrl;
                shopBase.setDataBinds(data, '#bindWxResult, #setPayBox>.box-content');
                /*if(data.mch_id) {
                    $(idStrHeaderBar).children().removeClass('disabled');
                }*/
                callback(data);
            },
            error: function () {
                callback({});
            }
        })
    }

    
    $('#btnAudit').on('click', function () {
        ajax.postAjaxData({
            url: 'merchant/shops/'+ shopInfoData.shop_id +'/weixin/wxaapp/submit_audit',
            success: function () {
                getShopInfo(true);
            }
        })
    });


    /*
     * TODO 配置支付
     * */
    $('#btnSetPay').on('click', function () {
        var data = shopBase.getAndVerificationData($(this).parent().parent(), true);
        if(!data) return;
        data.shopId = shopInfoData.shop_id;
		
        if(shopInfoData.template_id !== 25 && shopInfoData.template_id !== 26){
            ajax.putAjaxData({
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/weixin/wxaapp/pay',
                data: data,
                success: function () {
                    $('#setPayModal').modal('hide');
                    shopBase.showTip('配置成功！');
                    window.location.reload();
                    // getShopInfo(true);
                }
            })
        }else{
        	// 判断手续费
			var poundageValue = $('input[name="poundage"]').val(); 
			if(poundageValue%1 !== 0 || !poundageValue){
				shopBase.showTip('提现手续费必须为整数!',true);
				return;
			}else if(poundageValue<1){
				shopBase.showTip('提现手续费最低为1%!',true);
				return;
			}
			//判断商户名称
			var mchNameValue = $('input[name="mchName"]').val(); 
			if(!mchNameValue){
				shopBase.showTip('请填写商户名称',true);
				return;
			}else if(mchNameValue.length>20){
				shopBase.showTip('商户名称最多20个字',true);
				return;
			}
            ajax.postAjaxData({
                url: config.getHekaFullPath()+ '/AuthorzerInfo/save',
                data: data,
                success: function () {
                    $('#setPayModal').modal('hide');
                    shopBase.showTip('配置成功！');
                    window.location.reload();
                    // getShopInfo(true);
                }
            })

        }
    });

    
    /*
    * 获取二维码
    * */
    function setQrCode() {
        var $qrCodeImg = $('#qrCodeImg');
        if($qrCodeImg.attr('loaded')) return;

        if(shopInfoData.is_wx_online && shopInfoData.update_status !== 2) { //正式二维码
            $qrCodeImg.attr('src', shopInfoData.wx_online_acode_src_string ).attr('loaded', 1).show().siblings().hide();
            $(idStrViewBox).find('.box-result').show().siblings().hide();
        } else { //体验二维码
            $(idStrViewBox).find('.box-content').show().siblings().hide();
            ajax.getAjaxData({
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/weixin/wxaapp/get_qrcode',
                success: function (result) {
                    $qrCodeImg.attr('src', 'data:image/png;base64,'+ result.base64).attr('loaded', 1).show().siblings().hide();
                },
                error: function () {
                    $qrCodeImg.hide().siblings('span').text('请求二维码失败').show();
                }
            })
        }
    }


    /*
    * 添加体验者
    * */
    $('#btnAddUser').on('click', function () {
        var data = shopBase.getAndVerificationData($(this).parent().parent(), true);
        if(!data) return;

        ajax.putAjaxData({
            url: 'merchant/shops/'+ shopInfoData.shop_id +'/weixin/wxaapp/bind_tester',
            data: data,
            success: function () {
                $('#addUserModal').modal('hide');
                shopBase.showTip('添加体验者成功！');
            }
        })
    });


    /*
     * TODO 解绑体验者
     * */
    $('#btnRemoveUser').on('click', function () {
        var data = shopBase.getAndVerificationData($(this).parent().parent(), true);
        if(!data) return;

        ajax.putAjaxData({
            url: 'merchant/shops/'+ shopInfoData.shop_id +'/weixin/wxaapp/unbind_tester',
            data: data,
            success: function () {
                $('#removeUserModal').modal('hide');
                shopBase.showTip('解绑体验者成功！');
            }
        });
    });

    $('#setPayModal, #removeUserModal, #addUserModal').on('show.bs.modal', function () {
        $(this).find('input').val('');
        $('input[name="poundage"]').val(1); //设置默认手续费
    });

}());