/**
 * Created by gen on 2017/6/13.
 */

shopBase.getShopInfo(function (shopInfoData) {
    //主营类目
    var productCategories = [{ id: 1, name: '服装'}, { id: 2, name: '餐饮美食'}, { id: 3, name: '鲜花'}];
    var productCategoryData = shopBase.findItemInObjectArray(productCategories, 'id', shopInfoData.product_category);
    if(productCategoryData) {
        shopInfoData.commodity_category_text = productCategoryData.name;
    }

    var defaultImageUrl = config.getDefImgUrl();
    var $viewContainer = $('#viewContainer'),
        $editContainer = $('#editContainer');
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

        $viewContainer.show();
        $editContainer.hide();
    }

    $('#btnEdit').on('click', function () {
        showEdit();
    });




    /*
     * 显示修改
     * */
    var $currentTarget;
    var strEditContentTemplate = 'editContent_2_Template';
    var idStrInputFile = '#fileUploadImage';
    var $formImgList = $('#formImgList');

    //初始化上传封面或内容图片
    shopBase.initFileUpload({
        fileInputId: idStrInputFile,
        maxFileSize: 1024 * 1024,
        success: function (result) {
            if($currentTarget) {
                $currentTarget.find('.image-contain').css('background-image', 'url('+ result.file_url +')');
                $currentTarget.find('input[name=cover_src], input[name=videotex_picture_src]').val(result.file_name);
            }
        }
    });

    //初始化上传图集
    shopBase.initFileUpload({
        fileInputId: '#fileImages',
        maxFileSize: 1024 * 1024,
        success: function (result) {
            $formImgList.append( template('photosTemplate', { result: [{
                file_resource_name: result.file_name, file_resource_name_string: result.file_url, defaultImageUrl: defaultImageUrl
            }]} ) ).siblings('.img-thumbnail').hide();
        }
    });

    //移除图集单个图片
    $formImgList.on('click', '.fa-remove', function () {
        var $li = $(this).getParentByTagName('li');
        var length = $li.siblings().length;
        var $imgDefault = $formImgList.siblings('.img-thumbnail');
        $li.remove();
        if(!length) {
            $imgDefault.show();
        } else {
            $imgDefault.hide();
        }
    });


    function showEdit() {
        shopBase.setDataBinds(shopInfoData, $editContainer);

        if(shopInfoData.imgs && shopInfoData.imgs.length){
            $formImgList.html(template('photosTemplate', { result: shopInfoData.imgs} ))
                .siblings('.img-thumbnail').hide();
        } else {
            $formImgList.empty().siblings('.img-thumbnail').show();
        }

        shopInfoData.videotexList.sort(function (a, b) {
            return a.videotex_seq - b.videotex_seq;
        });
        $editContainer.find('article').html( template(strEditContentTemplate, {
            result: shopInfoData.videotexList.length ? shopInfoData.videotexList : [{}],
            defaultImageUrl: defaultImageUrl,
            display: 'block'
        }) );

        $viewContainer.hide();
        $editContainer.show();
    }


    $('#btnSave').on('click', function () {
        var data = shopBase.getAndVerificationData($editContainer.find('.form-group-wrapper', true));
        if(!data) return;

        var seqIndex = 1;
        var videotexList = [];
        $editContainer.find('article>section').each(function () {
            var contentData = shopBase.getAndVerificationData($(this), true);
            if(!contentData) return;
            if(contentData.videotex_picture_src || contentData.videotex_title || contentData.videotex_content) {
                contentData.videotex_seq = seqIndex++; //序列
                videotexList.push(contentData);
            }
        });

        //图集
        var images = [];
        $formImgList.children('li').each(function () {
            var __data = shopBase.getAndVerificationData($(this), true);
            if(__data) images.push(__data);
        });
        data.imgs = images;

        data.videotexList = videotexList;

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
        $editContainer.hide().find(':input').val('');
    });

    /*
     * 内容模块的控制
     * */
    $editContainer.on('click', '.btn-file-single', function () { //触发上传图片(单张)
        $currentTarget = $(this).getParentByTagName('section');
        $(idStrInputFile).trigger('click');
    });

    //点击增加、移除功能
    $editContainer.find('article').on('click', '.btn-control', function () {
        var mode = $(this).data('mode');
        var $section = $(this).getParentByTagName('section');
        switch (mode) {
            case 'image':
            case 'title':
            case 'content':
                editAddContent($section, mode);
                break;
            case 'remove':
                editRemoveContent($section);
                break;
            case 'move-up':
                editMoveContentUp($section);
                break;
            case 'move-down':
                editMoveContentDown($section);
                break;
            default:
                break;
        }
    });

    function editAddContent($section, mode) {
        var item = { type: mode };
        $(template(strEditContentTemplate, {
            result: [item], defaultImageUrl: defaultImageUrl, display: 'none'
        })).insertAfter($section).slideToggle();
    }

    function editRemoveContent($section) {
        if($section.siblings('section').length) {
            var data = shopBase.getAndVerificationData($section);
            if(data.videotex_picture_src || data.videotex_title || data.videotex_content) {
                app.confirm({
                    content: '确定要移除此项吗',
                    callback: function () {
                        $section.slideToggle(function () {
                            $(this).remove()
                        });
                    }
                });
            } else {
                $section.slideToggle(function () {
                    $(this).remove()
                });
            }
        } else {
            app.show({
                type: 3, content: '至少要有一组内容!'
            });
        }
    }
    function editMoveContentUp($section) {
        if($section.prev('section').length) {
            $section.insertBefore($section.prev());
        }
    }
    function editMoveContentDown($section) {
        if($section.next('section').length) {
            $section.insertAfter($section.next());
        }
    }


}, true);