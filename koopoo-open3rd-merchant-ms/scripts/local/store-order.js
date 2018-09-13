/**
 * Created by gen on 2017/6/1.
 */

 // 获取小程序信息数据
//  获取本地信息
var temp = JSON.parse(sessionStorage.getItem('WM_C_I'))
console.log(temp.template_id)


// 默认不显示，启动开启
if(temp.template_id == 1){
    // 显示掉相关拼团相关数据
    $(".bu_temp1").css({'display':'block'})
}

var editObject = {
    idStrHeaderBar: '#editHeaderBar',
};

/**
 * 定义订单类目
 *  order_subject
 *  1 ==> 默认订单，普通订单
 *  2 ==> 拼团订单
 */
var order_subject = 1;

shopBase.getShopInfo(function (shopInfoData) {
    var isReceiver = true; //默认有收货地址
    if (shopInfoData.template_id === 5) {
        isReceiver = false;
    } else {
        $('#tdReceiver, #viewItemReceiver').show();
    }


    var defaultImageUrl = config.getDefImgUrl();
    var idStrListTable = '#categoriesTable';

    //分类列表
    var pintuan_status = ['未知', '拼团失败', '拼团中', '拼团成功']; // 拼团状态

    var pageLoader = new PagesLoader({
        url: 'merchant/shops/' + shopInfoData.shop_id + '/orders/list/BP',
        pageBarIdString: '#pageNavWrapper',
        data: {
            order_subject: order_subject
        },
        autoLoad: true,
        success: function (data) {
            if (order_subject == 1) {
                $(".show_pintuan").hide();
                data.result.forEach(function (item) {
                    item.orderStatus = dict.parseOrderStatusToHtml(item);
                    item.create_time = app.getLongToStrYMDHMS(item.create_time_long);
                    item.pintuan_show = 0;
                });
            } else {
                $(".show_pintuan").show();
                data.result.forEach(function (item) {
                    item.orderStatus = dict.parseOrderStatusToHtml(item);
                    item.create_time = app.getLongToStrYMDHMS(item.create_time_long);
                    item.pintuan_show = 1;
                    if (item.orderEnhancDetails != undefined) {
                        // item.pintuan_status_name = pintuan_status[item.orderEnhancDetails.bpStatus];
                        item.pintuan_status_name = dict.pintuan_status(item.orderEnhancDetails.bpStatus)
                        item.pintuan_status_code = item.orderEnhancDetails.bpStatus;
                    } else {
                        item.pintuan_status_name = pintuan_status[0];
                    }
                });
            }
            data.isReceiver = isReceiver;
            var $listTable = $(idStrListTable);
            $listTable.children('tbody').html(template('listTemplate', data));

            if (this.page.totalCount > 10) {
                $('#listTools').show();
                $listTable.removeClass('list-one-page');
            } else {
                $listTable.addClass('list-one-page');
            }
        }
    });

    /* 关键字搜索 */
    var $searchBar = $('#searchBar');
    $searchBar.on('click', '#btnSearch', searchDataByKeyword);
    $searchBar.on('keyup', function (e) {
        app.checkEnterKey(function () {
            searchDataByKeyword();
        }, e);
    });
    $searchBar.on('click', 'i.fa-remove', function () {
        $searchBar.removeClass('searching').find('input[name=keyword]').val('');
        pageLoader.resetThenRequest({}); //置空请求的数据
    });

    //准备搜索
    function searchDataByKeyword() {
        var val = $searchBar.find('input[name=keyword]').val().trim();
        if (!val) return;

        pageLoader.resetThenRequest({
            order_flow_id: val
        });
        $searchBar.addClass('searching');
    }

    /*
     * 表格的一些操作
     * */
    $(idStrListTable + '>tbody').on('click', '.mc-btn-text', function () {
        var mode = $(this).data('mode');
        var $tr = $(this).getParentByTagName('tr');
        showEdit($tr.data('id'), mode);
    });




    /*
     * 查看、修改状态
     * */
    var $editFormContainer = $('#editFormContainer');
    var $statusTools = $('#statusTools');
    var orderId;
    var changeStatus;
    var isRefresh = false; //是否需要刷新列表

    function showEdit(id, mode) {
        $(".wl").css({
            "display": "none"
        })
        if (!id) return;
        ajax.getAjaxData({
            url: 'merchant/shops/' + shopInfoData.shop_id + '/orders/' + id,
            success: function (data) {
                orderId = id;
                var orderStatus = dict.parseOrderStatusToHtml(data.order);
                data.order.payHtml = orderStatus.payHtml;
                data.order.deliveryHtml = orderStatus.deliveryHtml;
                data.order.create_time = app.getLongToStrYMDHM(data.order.create_time_long);
                // data.pintuan_status = data.orderEnhancDetails.success_status


                shopBase.setDataBinds(data.order, $editFormContainer.find('#editBaseInfo'));
                $editFormContainer.find('#viewContentTable>tbody').html(template('viewContentTemplate', {
                    result: data.orderItems,
                    defaultImageUrl: defaultImageUrl
                }));

                $('#editTile').children('[data-mode=' + (mode || 'view') + ']').show().siblings().hide();
                if (mode === 'edit') {
                    if (data.order.pay_status === 2) { //已支付
                        if (data.order.shipping_status === 0) { //待发货
                            $statusTools.children('[data-status=2]').show();
                        } else {
                            $statusTools.children('[data-status=2]').hide();
                        }
                        $statusTools.children('[data-status=4]').show(); //退款退货
                        $editFormContainer.find('.edit-tools-wrapper').show();
                    } else {
                        $editFormContainer.find('.edit-tools-wrapper').hide();
                    }
                } else {
                    $editFormContainer.find('.edit-tools-wrapper').hide();
                }

                if (data.order.pay_status !== 1) {
                    $('#payAmountWrapper').children('[data-mode=1]').show().siblings().hide();
                } else {
                    $('#payAmountWrapper').children('[data-mode=2]').show().siblings().hide();
                }

                $editFormContainer.show().siblings('.page-list-container').hide();
            }
        });

    }

    $statusTools.on('click', '.btn-edit', function () {
        //获取物流公司
        $(".wl").css({
            "display": "none"
        })
        var status = $(this).data('status');
        var title;
        var data = {};
        var type;
        changeStatus = status;
        if (status === 2) { //发货
            type = '/deliver';
            data.shipping_status = status;
            title = '已发货';
        } else if (status === 4) { //退款
            type = '/refund';
            data.pay_status = status;
            title = '退款退货';
            var $btn = $(this);
            top.app.confirm({
                title: '更改状态',
                content: '<div class="pt-5 pb-15">确定将订单状态更改为“ <strong>' + title + '</strong> ”吗</div>',
                callback: function () {
                    $btn.attr('disabled', 'disabled');
                    ajax.putAjaxData({
                        url: 'merchant/shops/' + shopInfoData.shop_id + '/orders/' + orderId + type,
                        data: data,
                        success: function () {
                            location.reload();
                            app.show({
                                content: '提交成功',
                                type: 1
                            });
                        },
                        complete: function () {
                            $btn.removeAttr('disabled');
                        }
                    });
                }
            })
            return;
        }

        ajax.getAjaxData({
            url: 'merchant/shops/' + shopInfoData.shop_id + '/lc',
            data: data,
            success: function (res) {
                if (res.success) {
                    $(".wl").css({
                        "display": "block"
                    })
                    var htmls = '';
                    for (var i = 0; i < res.data.length; i++) {
                        htmls += "<option value='" + res.data[i].logisticsCompanyId + "'>" + res.data[i].name + "</option>"
                    }
                    $("#wl_comp").append(htmls)
                } else {

                }
            },
            complete: function () {
                $btn.removeAttr('disabled');
            }
        });
        var $btn = $(this);
    });
    $(".end_ti").click(function () {
        var reg = /^[1-9]+[0-9]+$/;
        if ($("#wl_comp").val() == undefined && $("#wl_comp").val() != null) {
            app.show({
                content: '请选择物流公司',
                type: 1
            });
            return;
        } else if ($(".wl_number").val() == undefined && $(".wl_number").val() != null) {
            app.show({
                content: '请输入正确的运单号',
                type: 3
            });
            return;
        } else {
            //确定提交
            ajax.putAjaxData({
                url: 'merchant/shops/' + shopInfoData.shop_id + '/lc/order/' + orderId,
                data: {
                    logistics_company_id: $("#wl_comp").val(),
                    logistics_post_no: $(".wl_number").val()
                },
                success: function (res) {
                    if (res.success) {
                        location.reload();
                        app.show({
                            content: '提交成功',
                            type: 1
                        });
                    } else {
                        app.show({
                            content: res.errorMsg,
                            type: 3
                        });
                    }
                },
                error: function () {
                    app.show({
                        content: '系统错误',
                        type: 3
                    });
                }
            });
        }
    });


    $('#btnEditFormCancel').on('click', function () {
        resetFormOfEditing();
    });


    function resetFormOfEditing() {
        if (isRefresh) {
            pageLoader.resetThenRequest(true);
        }
        isRefresh = false;
        orderId = null;
        changeStatus = null;
        $editFormContainer.hide().siblings('.page-list-container').show();
    }

    //区分订单类型 、普通订单/拼团订单
    $(".order_common").click(function () {
        $(this).addClass('active');
        $(".order_tuan").removeClass('active');
        if (order_subject != 1) {
            order_subject = 1;
            pageLoader.resetThenRequest({
                order_subject: 1
            });
        }

    })
    $(".order_tuan").click(function () {
        $(this).addClass('active');
        $(".order_common").removeClass('active');
        if (order_subject == 1) {
            order_subject = 2;
            pageLoader.resetThenRequest({
                order_subject: 2
            });
        }
    })
});