/**
 * Created by gen on 2017/6/16.
 */
shopBase.getShopInfo(function (shopInfoData) {

    shopBase.setDataBinds(shopInfoData, '#viewContainer');


    var $viewContainer = $('#viewContainer');
    var $editContainer = $('#editContainer');


    /*
    * 准备修改
    * */
    $('#btnEdit').on('click', function () {
        showEdit();
    });



    /*
    * 修改
    * */
    function showEdit() {
        shopBase.setDataBinds(shopInfoData, $editContainer);
        $viewContainer.hide();
        $editContainer.show();
    }


    $('#btnCancel').on('click', function () {
        editDone(this);
    });

    $('#btnSave').on('click', function () {
        var data = shopBase.getAndVerificationData($editContainer, true);
        if(!data) return;

        if(data.munimum_delivery_price > data.exceeds_price_free) {
            app.show({ content:'起送金额不能大于免运费金额！', type: 3 });
            return;
        }

        var $btn = $(this).attr('disabled', 'disabled');
        ajax.putAjaxData({
            url: 'merchant/shops/'+ shopInfoData.shop_id,
            data: $.extend({}, shopInfoData, data),
            success: function () {
                shopBase.getShopInfo(function (newData) {
                    shopBase.showTip('修改成功');
                    editDone($btn);
                    shopBase.setDataBinds(newData, '#viewContainer');
                    shopInfoData = newData;
                }, true);
            },
            complete: function () {
                $btn.removeAttr('disabled');
            }
        })
    });

    function editDone() {
        $editContainer.hide().find('input').val('');
        $viewContainer.show();
    }
}, true);