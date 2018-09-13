/**
 * Created by gen on 2017/6/1.
 */

shopBase.getShopInfo(function (shopInfoData) {
    var defaultImageUrl = config.getDefImgUrl();
    var idStrListTable = '#listTable';
    var $listTools = $('#listTools');


    //列表
    var pageLoader = new PagesLoader({
        url: 'merchant/shops/'+ shopInfoData.shop_id +'/bookings/list',
        pageBarIdString: '#pageNavWrapper',
        autoLoad: true,
        success: function (data) {
            data.default_img_src = defaultImageUrl;
            data.result.forEach(function (item) {
                item.booking_time = app.getLongToStrYMDHM(item.booking_time_long);
                item.status_html = translateBookingStatusToHtml(item.booking_status);
            });
            $(idStrListTable +'>tbody').html(template('listTemplate', data));
            if(this.page.totalCount > 10) {
                $listTools.show();
                $(idStrListTable).removeClass('list-one-page');
            } else {
                $(idStrListTable).addClass('list-one-page');
            }
        }
    });


    /* 关键字搜索 */
    var $searchBar = $('#searchBar');
    $searchBar.on('click', '#btnSearch', searchDataByKeyword);
    $searchBar.on('keyup', function (e) {
        app.checkEnterKey(function(){
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
        if(!val) return;

        pageLoader.resetThenRequest({
            title_like: val
        });
        $searchBar.addClass('searching');
    }



    /*
     * 表格的一些操作
     * */
    $(idStrListTable +'>tbody').on('click', '.mc-btn-text', function () {
        var mode = $(this).data('mode');
        var $tr = $(this).getParentByTagName('tr');
        showEdit($tr.data('id'), mode);
    });


    //1:确认中 2:预约成功  3:预约失败 4:已取消 5:已完成
    function translateBookingStatusToString(status) {
        var text;
        switch (status) {
            case 1: text = '确认中';
                break;
            case 2: text = '成功';
                break;
            case 3: text = '失败';
                break;
            case 4: text = '已取消';
                break;
            case 5: text = '已完成';
                break;
            default: text = '';
                break;
        }
        return text;
    }
    function translateBookingStatusToHtml(status) {
        var text;
        switch (status) {
            case 1: text = '<span>确认中</span>';
                break;
            case 2: text = '<span class="color-green">已成功</span>';
                break;
            case 3: text = '<span class="color-red">已失败</span>';
                break;
            case 4: text = '<span class="color-light-gray">已取消</span>';
                break;
            case 5: text = '<span class="color-light-gray">已完成</span>';
                break;
            default: text = '';
                break;
        }
        return text;
    }



    /*
    * 编辑
    * */
    var $editFormContainer = $('#editFormContainer');
    var $statusTools = $('#statusTools');
    var bookingId;
    var changeStatus;

    function showEdit(id, mode) {
        if(!id) return;
        ajax.getAjaxData({
            url: 'merchant/shops/'+ shopInfoData.shop_id +'/bookings/'+ id,
            success: function (data) {
                bookingId = id;

                data.status_text = translateBookingStatusToHtml(data.booking_status);
                data.booking_time = app.getLongToStrYMDHM(data.booking_time_long);
                if(!data.cover_src_string_small) data.cover_src_string_small = defaultImageUrl;
                shopBase.setDataBinds(data, $editFormContainer.find('#editBaseInfo'));

                if(mode == 'edit') {
                    $('#editTile').children('[data-mode=edit]').show().siblings().hide();
                    var status = -1;
                    if(data.booking_status == 1) status = 1; else if(data.booking_status == 2) status = 2;
                    $editFormContainer.find('.edit-tools').show();
                    $statusTools.children('[data-status='+ status +']').show().siblings().hide();
                } else {
                    $('#editTile').children('[data-mode=new]').show().siblings().hide();
                    $editFormContainer.find('.edit-tools').hide();
                }
                $editFormContainer.show().siblings('.page-list-container').hide();
            }
        });

    }

    $statusTools.on('click', '.btn-edit', function () {
        var status = $(this).data('status');
        var title;

        changeStatus = status;
        if(status == 3) {
            title = '预约状态更改为：<strong>预约失败</strong>';
        } else if(status == 4) {
            title = '预约状态更改为：<strong>取消预约</strong>';
        }
        if(title) {
            $('#changeStatusText').html(title);
        } else {
            if(status == 2) title = '预约成功'; else if(status == 5) title = '预约完成';
            app.confirm({
                title: '更改状态',
                content: '<div class="pt-5 pb-15">确定更改预约状态为“ <strong>'+ title +'</strong> ”吗</div>',
                callback: function () {
                    putStatus({remark: ''});
                }
            })
        }
    });


    $('#btnEditFormCancel').on('click', function () {
        resetFormOfEditing();
    });

    $('#btnChangeStatus').on('click', function () {
        var data = shopBase.getAndVerificationData($(this).getParentByClassName('modal-content'), true);
        if(data) {
            putStatus(data);
        }
    });

    $('#changeStatusModal').on('show.bs.modal', function () {
        $(this).find('textarea').val('');
    });

    //更改状态
    function putStatus(data) {
        if(!changeStatus) return;
        data.booking_status = changeStatus;
        ajax.putAjaxData({
            url: 'merchant/shops/'+ shopInfoData.shop_id +'/bookings/'+ bookingId,
            data: data,
            success: function () {
                $('#changeStatusModal').modal('hide');
                pageLoader.resetThenRequest();
                resetFormOfEditing();
            }
        });
    }



    function resetFormOfEditing() {
        bookingId = null;
        changeStatus = null;
        $editFormContainer.hide().siblings('.page-list-container').show();
        $editFormContainer.find('.image-contain').css('background-image', 'url('+ defaultImageUrl +')');
    }
});