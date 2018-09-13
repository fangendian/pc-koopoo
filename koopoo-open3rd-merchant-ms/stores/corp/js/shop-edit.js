/**
 * Created by gen on 2017/6/13.
 */

shopBase.getShopInfo(function (shopInfoData) {
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
    var strEditContentTemplate = 'editContent_Template';
    var idStrInputFile = '#fileUploadImage';

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


    function showEdit() {
        shopBase.setDataBinds(shopInfoData, $editContainer);

        var videotex;
        if(shopInfoData.videotexList.length === 3) {
            shopInfoData.videotexList.sort(function (a, b) {
                return a.videotex_seq - b.videotex_seq;
            });
        } else {
            videotex = [{
                videotex_content: null,
                videotex_picture_src_string: "",
                videotex_title: null
            }, {
                videotex_content: null,
                videotex_picture_src_string: "",
                videotex_title: null
            }, {
                videotex_content: null,
                videotex_picture_src_string: "",
                videotex_title: null
            }];
        }
        $editContainer.find('article').html( template(strEditContentTemplate, {
            result: videotex || shopInfoData.videotexList,
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
            if(!contentData) return false;
            if(contentData.videotex_picture_src || contentData.videotex_title || contentData.videotex_content) {
                contentData.videotex_seq = seqIndex++; //序列
                videotexList.push(contentData);
            }
        });

        console.log(videotexList);
        if(videotexList.length !== 3) {
            app.show({
                content: '请填写完整图文介绍！', type: 3
            });
            // $('#editFormItemTitle').animateCss('shake');
            return;
        }
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

}, true);