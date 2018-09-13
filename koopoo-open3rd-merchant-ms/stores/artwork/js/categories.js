/**
 * Created by gen on 2017/6/1.
 */

shopBase.getShopInfo(function (shopInfoData) {
    var defaultImageUrl = config.getDefImgUrl();
    var idStrListTable = '#listTable';
    var $listTools = $('#listTools');


    //分类列表
    var pageLoader = new PagesLoader({
        url: 'merchant/shops/'+ shopInfoData.shop_id +'/products/categorys/list',
        pageBarIdString: '#pageNavWrapper',
        autoLoad: true,
        success: function (data) {
            data.default_img_src = defaultImageUrl;
            $(idStrListTable +'>tbody').html(template('listTemplate', data));
            if(data.result.length) {
                $listTools.show();
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
            name_like: val
        });
        $searchBar.addClass('searching');
    }



    /*
     * 表格的一些操作
     * */
    var $checkedAll = $('#checkedAll', $listTools); //全选的CheckBox
    $(idStrListTable +'>tbody').on('change', ':checkbox', function () { //单选
        var checked = $(this)[0].checked;
        var $tr = $(this).getParentByTagName('tr');
        if(checked) {
            $tr.addClass('active');
            $listTools.find('button').removeAttr('disabled');
        } else {
            $tr.removeClass('active');
            $checkedAll[0].checked = false;
            setToolsButton();
        }
    })
    .on('click', '.btn-edit', function () {
        var $tr = $(this).getParentByTagName('tr');
        showEdit($tr.data('id'));
    });

    $checkedAll.on('change', function () { //全选
        var checked = !$(this)[0].checked;
        var $tbody = $(idStrListTable +'>tbody');
        if(checked) {
            $tbody.children().removeClass('active').each(function () {
                $(this).children(':first').find(':checkbox')[0].checked = false;
            });
            $listTools.find('button').attr('disabled', 'disabled');
        } else {
            $tbody.children().addClass('active').each(function () {
                $(this).children(':first').find(':checkbox')[0].checked = true;
            });
            $listTools.find('button').removeAttr('disabled');
        }
    });

    //批量删除
    $listTools.children('.list-tools-left').on('click', '#btnListRemove', function () {
        getIdList('确定要禁用吗？', function (idList, $trs) {
            ajax.deleteAjaxData({
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/products/categorys?items='+ idList.join(','),
                success: function () {
                    pageLoader.resetThenRequest();
                    $trs.remove();
                    setToolsButton();
                }
            })
        });
    });

    function getIdList(text, callback) {
        if(!(callback instanceof Function)) return;
        var idList = [];
        var $trs = $(idStrListTable +'>tbody').children('.active').each(function () { //循环遍历TR
            var checked = $(this).children(':first').find(':checkbox')[0].checked;
            var id = $(this).data('id');
            if(checked) {
                idList.push(id);
                $checkedAll[0].checked = false;
            }
        });
        if(!idList.length) return;

        app.confirm({
            content: text || '确定要执行操作吗？',
            callback: function () {
                callback(idList, $trs);
            }
        });
    }

    function setToolsButton() {
        var length = $(idStrListTable +'>tbody').children('.active').length;
        if(!length) $listTools.find('button').attr('disabled', 'disabled');
    }



    /*
    * 新增
    * */
    var $newFormContainer = $('#newFormContainer');
    $('#btnShowAddBox').on('click', function () {
        $newFormContainer.show().siblings('.page-list-container').hide();
    });

    shopBase.initFileUpload({
        fileInputId: '#fileUploadImage',
        maxFileSize: 1024 * 1024,
        success: function (result) {
            $newFormContainer.find('.image-contain').css('background-image', 'url('+ result.file_url +')');
            $newFormContainer.find('input[name=img_src]').val(result.file_name);
        }
    });

    $('#btnNewFormSubmit').on('click', function () {
        var data = shopBase.getAndVerificationData($newFormContainer);
        if(!data) return;

        data.parent_id = 0;
        ajax.postAjaxData({
            url: 'merchant/shops/'+ shopInfoData.shop_id +'/products/categorys',
            data: data,
            success: function () {
                pageLoader.resetThenRequest();
                resetFormCreate();
            }
        })
    });

    $('#btnNewFormCancel').on('click', function () {
        resetFormCreate();
    });

    function resetFormCreate() {
        $newFormContainer.hide().siblings('.page-list-container').show();
        $newFormContainer.find('input').val('');
        $newFormContainer.find('.image-contain').css('background-image', 'url('+ defaultImageUrl +')');
    }



    /*
    * 编辑
    * */
    var $editFormContainer = $('#editFormContainer');
    var categoryId;

    function showEdit(id) {
        if(!id) return;
        ajax.getAjaxData({
            url: 'merchant/shops/'+ shopInfoData.shop_id +'/products/categorys/'+ id,
            success: function (data) {
                categoryId = id;
                shopBase.setDataBinds(data, $editFormContainer);
                $editFormContainer.show().siblings('.page-list-container').hide();
                $editFormContainer.find('input[name=is_deleted]').bootstrapSwitch('state', data.is_deleted);
            }
        });
    }

    //初始化是否禁用开关
    $editFormContainer.find('input[name=is_deleted]').bootstrapSwitch();

    shopBase.initFileUpload({
        fileInputId: '#fileUploadImageOfEdit',
        maxFileSize: 1024 * 1024,
        success: function (result) {
            $editFormContainer.find('.image-contain').css('background-image', 'url('+ result.file_url +')');
            $editFormContainer.find('input[name=img_src]').val(result.file_name);
        }
    });

    $('#btnEditFormSubmit').on('click', function () {
        if(!categoryId) return;
        var data = shopBase.getAndVerificationData($editFormContainer);
        if(!data) return;

        data.parent_id = 0;
        ajax.putAjaxData({
            url: 'merchant/shops/'+ shopInfoData.shop_id +'/products/categorys/'+ categoryId,
            data: data,
            success: function () {
                pageLoader.resetThenRequest();
                resetFormOfEditing();
            }
        })
    });

    $('#btnEditFormCancel').on('click', function () {
        resetFormOfEditing();
    });

    function resetFormOfEditing() {
        categoryId = null;
        $editFormContainer.hide().siblings('.page-list-container').show();
        $editFormContainer.find('input').val('');
        $editFormContainer.find('.image-contain').css('background-image', 'url('+ defaultImageUrl +')');
    }
});