/**
 * Created by gen on 2017/6/1.
 */

shopBase.getShopInfo(function (shopInfoData) {
    var defaultImageUrl = config.getDefImgUrl();
    var idStrListTable = '#categoriesTable';
    var $listTools = $('#listTools');


    //用于区分不同模板的数据
    var ___data = {
        template_id: shopInfoData.template_id,
        maxFileSize: 1024 * 1024,
        fileSize: '1MB',
        iconTitle: '图片',
        noIcon: false,
        editIconTip: '',
        size: '750 &times; 500px',
        backgroundSize: ''
    };

    //根据不同的模板区分处理
    switch (shopInfoData.template_id) {
        case 19: //母婴
            ___data.size = '100 &times; 100px';
            ___data.editIconTip = '<span class="color-red">* </span>';
            break;
        case 14: //居家生活
            ___data.editIconTip = '<span class="color-red">* </span>';
            break;
        case 16:
        case 17:
            ___data.size = '54 &times; 54px';
            ___data.editIconTip = '<span class="color-red">* </span>';
            ___data.iconTitle = '小图标';
            ___data.backgroundSize = 'auto 54px';
            break;
        case 4: //美容美发
        case 7: //时尚店铺
        case 8: //艺术品
        case 9: //鲜花
        case 18: //美酒
            ___data.noIcon = true;
            break;
        default:
            break;
    }

    shopBase.setDataBinds(___data);

    if (!___data.noIcon) {
        $('#tableIconTitle').show();
        $('#editImageSrc').attr('data-not-null', 'true');
    } else {
        $('#editCover').hide();
    }
    if (___data.backgroundSize) $('.image-contain').css('background-size', ___data.backgroundSize);


    //分类列表
    var pageLoader = new PagesLoader({
        url: 'merchant/shops/'+ shopInfoData.shop_id +'/products/categorys/list',
        pageBarIdString: '#pageNavWrapper',
        autoLoad: true,
        success: function (data) {
            data.default_img_src = defaultImageUrl;
            data.noIcon = ___data.noIcon;

            var $listTable = $(idStrListTable);
            $listTable.children('tbody').html(template('listTemplate', data));

            if(data.result.length) {
                $listTools.show();
            }
            if(this.page.totalCount > 10) {
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
    * 新增、修改
    * */
    var $editFormContainer = $('#editFormContainer');
    var categoryId;
    var editMode;


    //根据不同模板填充数据
    shopBase.setDataBinds(___data, $editFormContainer);



    //初始化是否禁用开关
    $editFormContainer.find('input[name=is_deleted]').bootstrapSwitch();

    shopBase.initFileUpload({
        fileInputId: '#fileUploadImageOfEdit',
        maxFileSize: ___data.maxFileSize,
        success: function (result) {
            $editFormContainer.find('.image-contain').css('background-image', 'url('+ result.file_url +')');
            $editFormContainer.find('input[name=img_src]').val(result.file_name);
        }
    });

    $('#btnShowAddBox').on('click', function () {
        editMode = 'new';
        $('#editTile').children('[data-mode=new]').show().siblings().hide();
        $editFormContainer.show().siblings('.page-list-container').hide();
    });


    //修改
    function showEdit(id) {
        if(!id) return;
        ajax.getAjaxData({
            url: 'merchant/shops/'+ shopInfoData.shop_id +'/products/categorys/'+ id,
            success: function (data) {
                editMode = 'edit';
                $('#editTile').children('[data-mode=edit]').show().siblings().hide();

                categoryId = id;
                shopBase.setDataBinds(data, $editFormContainer);
                $editFormContainer.show().siblings('.page-list-container').hide();
                $editFormContainer.find('input[name=is_deleted]').bootstrapSwitch('state', data.is_deleted);
            }
        });
    }


    //保存数据
    $('#btnEditFormSubmit').on('click', function () {
        if(editMode === 'edit' && !categoryId) return;
        var data = shopBase.getAndVerificationData($editFormContainer);
        if(!data) return;

        data.parent_id = 0;

        var $btn = $(this).attr('disabled', 'disabled');
        if(editMode === 'new') {
            ajax.postAjaxData({
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/products/categorys',
                data: data,
                success: function () {
                    pageLoader.resetThenRequest();
                    resetFormOfEditing();
                },
                complete: complete
            })
        } else {
            ajax.putAjaxData({
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/products/categorys/'+ categoryId,
                data: data,
                success: function () {
                    pageLoader.resetThenRequest();
                    resetFormOfEditing();
                },
                complete: complete
            })
        }

        function complete() {
            $btn.removeAttr('disabled');
        }
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