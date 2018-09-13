/**
 * Created by gen on 2017/6/26.
 */

shopBase.getShopInfo(function (shopInfoData) {

    var defaultImageUrl = config.getDefImgUrl();
    var $viewContainer = $('#viewContainer'),
        $editContainer = $('#editContainer');


    var bannerData = shopInfoData.indexBanners;

    /*
     * 预览模式
     * */
    showView();

    function showView() {
        if(bannerData && bannerData.length) {
            $viewContainer.find('ul.photos-ul').html( template('viewPhotosTemplate', { result: bannerData}) );
        } else {
            $viewContainer.find('ul.photos-ul').html('<span><i class="fa fa-photo"></i> 请上传图片！</span>');
        }

        $('#btnEdit').removeAttr('disabled');

        $viewContainer.show();
        $editContainer.hide();
    }
    shopBase.getTemplateConfig(function(storesData) {
        var data = shopBase.findItemInObjectArray(storesData, 'id', shopInfoData.template_id);
        if(data && data.isBannerDefaultImg) {
            var src = '../../stores/'+ data.name +'/images/banner_default.jpg';
            $('#bannerDefault').attr('src', src).getParentByClassName('banner-default-wrapper').show();
        }
    });


    //
    var idStrOfFile;
    var __data = {
        template_id: shopInfoData.template_id,
        maxFileSize: 1024 * 1024,
        imagesLimit: 1000,
        fileSize: '1MB',
        size: '750 &times; 500px',
        photoText: '图集'
    };

    //根据不同的模板区分处理
    switch (shopInfoData.template_id) {
        case 7:
            __data.size = '686 &times; 1108px';
            __data.imagesLimit = 1;
            break;
        case 12:
            __data.size = '750 &times; 600px';
            break;
        case 13:
            __data.imagesLimit = 1;
            break;
        case 14:
            __data.size = '750 &times; 350px';
            break;
        default:
            idStrOfFile = '#fileUploadImages';
            break;
    }
    if(__data.imagesLimit === 1) {
        __data.idStrOfFile = '#fileUploadImage';
        __data.photoText = '图片';
    } else {
        __data.idStrOfFile = '#fileUploadImages';
    }

    shopBase.setDataBinds(__data, '#editContainer');
    $('#tipBox').html( template('tipTemplate', __data) );

    $('#btnEdit').on('click', function () {
        showEdit();
    });

    $('#btnFile').on('click', function () {
        $(__data.idStrOfFile).trigger('click');
    });




    /*
    * 显示修改
    * */
    var $formImgList = $('#formImgList');


    //初始化上传图集
    shopBase.initFileUpload({
        fileInputId: __data.idStrOfFile,
        maxFileSize: __data.maxFileSize,
        success: function (result) {
            $formImgList.append( template('photosTemplate', { result: [{
                file_resource_name: result.file_name, file_resource_name_string: result.file_url, defaultImageUrl: defaultImageUrl
            }]} ) ).siblings('.img-thumbnail').hide();
            imagesCountHandle();
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
        imagesCountHandle();
    });

    //图片数量控制
    function imagesCountHandle() {
        var length = $formImgList.children('li').length;
        if(length >= __data.imagesLimit) {
            $('.btn.btn-file').hide();
        } else {
            $('.btn.btn-file').show();
        }
    }

    function showEdit() {
        if(bannerData && bannerData.length){
            $formImgList.html(template('photosTemplate', { result: bannerData} ))
                .siblings('.img-thumbnail').hide();
        } else {
            $formImgList.empty().siblings('.img-thumbnail').show();
        }
        imagesCountHandle();

        $viewContainer.hide();
        $editContainer.show();
    }


    $('#btnSave').on('click', function () {
        var data = {};
        //图集
        var images = [];
        $formImgList.children('li').each(function () {
            var __data = shopBase.getAndVerificationData($(this), true);
            if(__data) images.push(__data);
        });
        if(images.length) {
            data.indexBanners = images;
        }

        var $btn = $(this);
        $btn.attr('disabled', 'disabled');

        ajax.putAjaxData({
            url: '/merchant/shops/'+ shopInfoData.shop_id +'/index/banner',
            data: data,
            success: function () {
                shopBase.showTip('修改成功');

                bannerData = data.indexBanners;
                showView();
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

}, true);