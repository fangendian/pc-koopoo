/**
 * Created by gen on 2017/6/13.
 */

shopBase.getShopInfo(function (shopInfoData) {

    var defaultImageUrl = config.getDefImgUrl();
    var $viewContainer = $('#viewContainer');
    var editObject = {
        $formContainer: $('#editContainer'),
        $formImgList: $('#formImgList'),
        defaultImageUrl: defaultImageUrl,
        idStrInputFile: '#fileUploadImage',
        idStrContentFile: '#fileUploadImagesForContent',
        $currentTarget: null,
        strEditContentTemplate: 'editContent_2_Template'
    };



    /*
     * 预览模式
     * */
    showView();

    function showView() {
        shopBase.setDataBinds(shopInfoData, $viewContainer);

        if(shopInfoData.imgs.length) {
            $viewContainer.find('ul.photos-ul').html( template('viewPhotosTemplate', { result: shopInfoData.imgs}) );
        } else {
            $viewContainer.find('ul.photos-ul').html('<span>无</span>');
        }

        var $table = $viewContainer.find('table.form-view-container');
        if(shopInfoData.videotexList.length) {
            shopInfoData.videotexList.sort(function (a, b) {
                return a.videotex_seq - b.videotex_seq;
            });
            $table.show().siblings('span').hide();
            $('tbody', $table).html( template('viewContent_2_Template', { result: shopInfoData.videotexList}) );
        } else {
            $table.hide().siblings('span').show();
        }

        $('#btnEdit').removeAttr('disabled');
        $viewContainer.show().siblings('#editContainer').hide();
    }

    $('#btnEdit').on('click', function () {
        showEdit();
    });




    /*
     * 显示修改
     * */


    //初始化上传封面或内容图片
    shopBase.initFileUpload({
        fileInputId: editObject.idStrInputFile,
        maxFileSize: 1024 * 1024,
        success: function (result) {
            if(editObject.$currentTarget) {
                editObject.$currentTarget.find('.image-contain').css('background-image', 'url('+ result.file_url +')');
                editObject.$currentTarget.find('input[name=cover_src], input[name=videotex_picture_src]').val(result.file_name);
            }
        }
    });

    //初始化上传图集
    shopBase.initFileUpload({
        fileInputId: '#fileImages',
        maxFileSize: 1024 * 1024,
        success: function (result) {
            editObject.$formImgList.append( template('photosTemplate', { result: [{
                file_resource_name: result.file_name, file_resource_name_string: result.file_url, defaultImageUrl: defaultImageUrl
            }]} ) ).siblings('.img-thumbnail').hide();
        }
    });

    //移除图集单个图片
    editObject.$formImgList.on('click', '.fa-remove', function () {
        var $li = $(this).getParentByTagName('li');
        var length = $li.siblings().length;
        var $imgDefault = editObject.$formImgList.siblings('.img-thumbnail');
        $li.remove();
        if(!length) {
            $imgDefault.show();
        } else {
            $imgDefault.hide();
        }
    });


    function showEdit() {
        shopBase.setDataBinds(shopInfoData, editObject.$formContainer);

        if(shopInfoData.imgs && shopInfoData.imgs.length){
            editObject.$formImgList.html(template('photosTemplate', { result: shopInfoData.imgs} ))
                .siblings('.img-thumbnail').hide();
        } else {
            editObject.$formImgList.empty().siblings('.img-thumbnail').show();
        }

        shopInfoData.videotexList.sort(function (a, b) {
            return a.videotex_seq - b.videotex_seq;
        });
        editObject.$formContainer.find('article').html( template(editObject.strEditContentTemplate, {
            result: shopInfoData.videotexList.length ? shopInfoData.videotexList : [{type: 'content'}],
            defaultImageUrl: defaultImageUrl,
            display: 'block'
        }) );

        $viewContainer.hide();
        editObject.$formContainer.show();
    }


    $('#btnSave').on('click', function () {
        var data = shopBase.getAndVerificationData(editObject.$formContainer.find('.form-group-wrapper', true));
        if(!data) return;

        var seqIndex = 1;
        var videotexList = [];
        editObject.$formContainer.find('article>section').each(function () {
            var contentData = shopBase.getAndVerificationData($(this), true);
            if(!contentData) return;
            if(contentData.videotex_picture_src || contentData.videotex_title || contentData.videotex_content) {
                contentData.videotex_seq = seqIndex++; //序列
                videotexList.push(contentData);
            }
        });

        //图集
        var images = [];
        editObject.$formImgList.children('li').each(function () {
            var __data = shopBase.getAndVerificationData($(this), true);
            if(__data) images.push(__data);
        });
        data.imgs = images;

        data.videotexList = videotexList;
        if(shopInfoData.template_id !== 3) {
            data.unified_delivery_fees = 0;
        }

        var $btn = $(this);
        $btn.attr('disabled', 'disabled');
        $viewContainer.find('input,textarea').attr('disabled', 'disabled');

        ajax.putAjaxData({
            url: 'merchant/shops/'+ shopInfoData.shop_id,
            data: $.extend({}, shopInfoData, data),
            success: function () {
                sessionStorage.removeItem(config.lsk_shop_info);
                shopBase.showTip('修改成功');

                shopBase.getShopInfo(function (newData) {
                    if(top.shopBase) {
                        top.shopBase.setDataBinds(newData);
                    }
                    shopInfoData = newData;
                    showView();
                });
            },
            complete: function () {
                $btn.removeAttr('disabled');
            }
        })
    });

    $('#btnCancel').on('click', function () {
        $viewContainer.show();
        editObject.$formContainer.hide().find(':input').val('');
    });

    /*
     * 内容模块的控制
     * */
    initPageForPhotoWithContent(editObject);


}, true);