/**
 * Created by gen on 2017/6/2.
 */

shopBase.getShopInfo(function (shopInfoData) {
    var defaultImageUrl = config.getDefImgUrl();
    var idStrListTable = '#listTable';
    var $listTools = $('#listTools');


    //分类列表
    var pageLoader = new PagesLoader({
        url: 'merchant/shops/'+ shopInfoData.shop_id +'/products/list',
        pageBarIdString: '#pageNavWrapper',
        autoLoad: true,
        success: function (data) {
            data.defaultImageUrl = defaultImageUrl;
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
    .on('click', '.mc-btn-text', function () { //点击按钮
        var $tr = $(this).getParentByTagName('tr');
        var id = $tr.data('id');
        if($(this).hasClass('btn-edit')) {
            showEdit(id);
        } else {
            showView(id);
        }
    });

    //全选
    $checkedAll.on('change', function () {
        var checked = !$(this)[0].checked;
        var $tbody = $(idStrListTable +'>tbody');
        if(checked) { //取消
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
        getIdList('确定要删除吗？', function (idList, $trs) {
            ajax.deleteAjaxData({
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/products?items='+ idList.join(','),
                success: function () {
                    pageLoader.resetThenRequest();
                    $trs.remove();
                    setToolsButton();
                }
            })
        });
    }).on('click', '#btnListOnline', function () {
        getIdList('确定要执行上架吗？', function (idList, $trs) {
            ajax.putAjaxData({
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/products/shelve?items='+ idList.join(','),
                success: function () {
                    $trs.removeClass('active');
                    pageLoader.resetThenRequest();
                    setToolsButton();
                }
            })
        });
    }).on('click', '#btnListOffline', function () {
        getIdList('确定要执行下架吗？', function (idList, $trs) {
            ajax.putAjaxData({
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/products/unshelve?items='+ idList.join(','),
                success: function () {
                    $trs.removeClass('active');
                    pageLoader.resetThenRequest();
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

        top.app.confirm({
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
    var editObject = {
        $formContainer: $('#formContainer'),
        $currentTarget: null,
        defaultImageUrl: defaultImageUrl,
        idStrHeaderBar: '#editHeaderBar',
        idStrInputFile: '#fileUploadImage',
        idStrContentFile: '#fileUploadImagesForContent',
        idStrFormImgList: '#formImgList',
        isChange: false, //内容是否更改，用于取消提醒
        isFirstEdit: true, //第一次编辑
        strEditContentTemplate: 'editContent_2_Template',
        editMode: '', //'new':新增, 'edit':修改
        productId: null,
        categoryId: null,
        categoriesData: null
    };

    var __verificationData; //临时待保存的数据


    //初始化上传封面或内容图片
    shopBase.initFileUpload({
        fileInputId: editObject.idStrInputFile,
        maxFileSize: 1024 * 1024,
        success: function (result) {
            if(editObject.$currentTarget) {
                editObject.$currentTarget.find('.image-contain').css('background-image', 'url('+ result.file_url +')');
                editObject.$currentTarget.find('input[name=cover_src], input[name=videotex_picture_src], input[name=video_cover_src]').val(result.file_name);
                editObject.isChange = true;
            }
        }
    });

    //初始化是否禁用开关
    editObject.$formContainer.find('.from-is-checkbox :checkbox').bootstrapSwitch();

    //填写步骤进度
    $(editObject.idStrHeaderBar).on('click', 'li', function () {
        if($(this).hasClass('disabled') || $(this).hasClass('active')) return;

        $(this).addClass('active').siblings().removeClass('active');
        $('#'+ $(this).attr('aria-controls')).show().siblings().hide();
    });

    //上传封面
    $('#btnCoverImg').on('click', function () {
        editObject.$currentTarget = $(this).getParentByClassName('form-item-content');
        $(editObject.idStrInputFile).trigger('click');
    });


    function getCategoriesData(callback) {
        if(!editObject.categoriesData) {
            ajax.getAjaxData({
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/products/categorys/list',
                success: function (data) {
                    editObject.categoriesData = data.result;
                    if(callback) callback(editObject.categoriesData);
                }
            });
        } else {
            if(callback) callback(editObject.categoriesData);
        }
    }


    /*
    * 新增
    * */
    $('#btnShowAddBox').on('click', function () {
        getCategoriesData();
        $('#editTile').children('[data-mode=new]').show().siblings().hide();

        editObject.editMode = 'new';
        editObject.isFirstEdit = false;
        editObject.$formContainer.show().siblings('.page-list-container').hide();

        editObject.$formContainer.find('#baseInfoBox').show().siblings('.tab-pane').hide();
        $('#shopCoverImg, #videoCoverImg').css('background-image', 'url('+ defaultImageUrl +')');

        $(template(editObject.strEditContentTemplate, {
            result: [{type: 'content'}], defaultImageUrl: defaultImageUrl
        })).appendTo(editObject.$formContainer.find('article')).slideToggle(0);

        $(editObject.idStrFormImgList).siblings('.img-thumbnail').show();
    });

    //进入第三步
    $('#btnNextToStep3').on('click', function () {
        editObject.isChange = true;
        verificationData(function () { //验证第二步信息
            $(editObject.idStrHeaderBar).children('[aria-controls=contentBox]').removeClass('disabled').trigger('click');
        });
    });

    //点击取消
    editObject.$formContainer.find('button.btn-cancel').on('click', function () {
        if(editObject.isChange) {
            top.app.confirm({
                title: '确定要取消吗?',
                content: '如果点击确定，已经编辑的内容将会丢失！',
                callback: function () {
                    resetFormContent();
                }
            });
        } else {
            resetFormContent();
        }
    });


    /*
    * 上传视频
    * */
    shopBase.initFileUpload({
        fileInputId: '#inputVideoFile',
        maxFileSize: 1024 * 1024 * 100, //100MB
        fileType: 'video',
        success: function (result) {
            editObject.isChange = true;
            $('#videoFileImage').addClass('video-contain-ok').getParentByClassName('form-item-content').find('input[name=video_src]').val(result.file_name);
            $('#videoCoverWrapper').show();
        }
    });

    $('#btnVideoCoverImg').on('click', function () {
        editObject.$currentTarget = $(this).getParentByClassName('form-item-content');
        $(editObject.idStrInputFile).trigger('click');
    });


    /*
    * 上传图集
    * */
    shopBase.initFileUpload({
        fileInputId: '#fileImages',
        maxFileSize: 1024 * 1024,
        success: function (result) {
            editObject.isChange = true;
            $(editObject.idStrFormImgList).append( template('photosTemplate', { result: [{
                file_resource_name: result.file_name, file_resource_name_string: result.file_url, defaultImageUrl: defaultImageUrl
            }]} ) ).siblings('.img-thumbnail').hide();
        }
    });

    //移除图集单个图片
    $(editObject.idStrFormImgList).on('click', '.fa-remove', function () {
        var $li = $(this).getParentByTagName('li');
        var length = $li.siblings().length;
        var $imgDefault = $(editObject.idStrFormImgList).siblings('.img-thumbnail');
        $li.remove();
        if(!length) {
            $imgDefault.show();
        } else {
            $imgDefault.hide();
        }
    });



    /*
    * 内容模块的控制
    * */
    initPageForPhotoWithContent(editObject);


    /*
    * 保存数据
    * */
    $('#btnFormSubmit').on('click', function () {
        if(editObject.editMode === 'edit' && !editObject.productId) return;
        var data = verificationData();
        if(!data) {
            $(editObject.idStrHeaderBar).children('[aria-controls=baseInfoBox]').trigger('click');
            return;
        }

        //收集内容
        var videotexList = [];
        var seqIndex = 0;
        editObject.$formContainer.find('article>section').each(function () {
            var contentData = shopBase.getAndVerificationData($(this), true);
            if(!contentData) return;
            if(contentData.videotex_picture_src || contentData.videotex_title || contentData.videotex_content) {
                contentData.videotex_seq = seqIndex++; //序列
                videotexList.push(contentData);
            }
        });
        if(videotexList.length) {
            data.videotexList = videotexList;
        }

        // console.log('待提交的数据', JSON.stringify(data));
        if(editObject.editMode === 'new') { //新增
            ajax.postAjaxData({
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/products',
                data: data,
                success: function () {
                    pageLoader.resetThenRequest();
                    resetFormContent();
                }
            })
        } else { //修改
            ajax.putAjaxData({
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/products/'+ editObject.productId,
                data: data,
                success: function () {
                    pageLoader.resetThenRequest();
                    resetFormContent();
                }
            })
        }
    });

    /*
    * 验证并且收集基本信息
    * */
    function verificationData(callback) {
        if(!editObject.categoriesData) {
            app.show({ content: '抱歉缺少分类！', type: 3});
            return;
        }
        //基础信息
        var data = shopBase.getAndVerificationData('#baseInfoWrapper', true);
        if(!data) return;

        //视频信息
        var $videoInfoWrapper = $('#videoInfoWrapper');
        var videoSrc = $videoInfoWrapper.find('input[name=video_src]').val(),
            videoCoverSrc;
        if(videoSrc) {
            videoCoverSrc = $videoInfoWrapper.find('input[name=video_cover_src]').val();
            if(!videoCoverSrc) {
                app.show({ content: '请上传视频封面！', type: 3 });
                $('body').animate({scrollTop: $('#videoCoverWrapper').offset().top - 20}, 300);
                return;
            }
            data.video_src = videoSrc;
            data.video_cover_src = videoCoverSrc;
        }

        //图集
        var images = [];
        $(editObject.idStrFormImgList).children('li').each(function () {
            var __data = shopBase.getAndVerificationData($(this), true);
            if(__data) images.push(__data);
        });
        if(images.length) {
            data.imgs = images;
        }


        //物流/其他
        var otherData = shopBase.getAndVerificationData('#shopOtherWrapper', true);
        if(!otherData) return;
        $.extend(true, data, otherData);
        data.delivery_type = 0; //统一物流
        if(!data.delivery_fees) data.delivery_fees = 0; //运费

        data.product_category_id = editObject.categoriesData.length ? editObject.categoriesData[0].product_category_id : 1; //默认
        data.is_unified_spec = true;
        data.stock = 100000;
        data.market_price = 0;
        data.is_list = true;

        // console.log('基本信息:', data);
        __verificationData = data;
        if(callback instanceof Function) {
            callback();
        } else {
            return __verificationData;
        }
    }



    /*
    * 修改
    * */
    function showEdit(id){
        if(!id) return;
        $('#editTile').children('[data-mode=edit]').show().siblings().hide();
        getCategoriesData();
        ajax.getAjaxData({
            url: 'merchant/shops/' + shopInfoData.shop_id + '/products/' + id,
            success: function (data) {
                // console.log('get product:', data);
                editObject.editMode = 'edit';
                editObject.productId = id;
                editObject.isFirstEdit = true;

                /*
                * 填充数据
                * */
                shopBase.setDataBinds(data.product, editObject.$formContainer.find('.group-base-wrapper'));

                if(data.product.video_cover_src) {
                    if(!data.product.video_cover_src_string) data.product.video_cover_src_string = defaultImageUrl;
                    shopBase.setDataBinds(data.product, '#videoInfoWrapper');
                    $('#videoFileImage').addClass('video-contain-ok');
                    $('#videoCoverWrapper').show();
                } else {
                    $('#videoCoverWrapper').hide();
                }

                if(data.imgs && data.imgs.length){
                    editObject.$formContainer.find(editObject.idStrFormImgList).html(template('photosTemplate', { result: data.imgs} ))
                        .siblings('.img-thumbnail').hide();

                }
                //设置开关控件
                editObject.$formContainer.find('.from-is-checkbox :checkbox').each(function () {
                    $(this).bootstrapSwitch('state', data.product[$(this).attr('name')]);
                });

                data.videotexList.sort(function (a, b) {
                    return a.videotex_seq - b.videotex_seq;
                });
                $(template(editObject.strEditContentTemplate, {
                    result: data.videotexList.length ? data.videotexList : [{type:'content'}],
                    defaultImageUrl: defaultImageUrl,
                    display: 'block'
                })).appendTo(editObject.$formContainer.find('article'));

                editObject.$formContainer.show().siblings('.page-list-container').hide();
            }
        });
    }


    /*
    * 重置表单及内容
    * */
    function resetFormContent() {
        editObject.editMode = '';
        editObject.productId = null;
        editObject.categoryId = null;
        editObject.$currentTarget = null;
        __verificationData = null;
        editObject.isChange = false;

        editObject.$formContainer.hide().siblings('.page-list-container').show();

        $('#videoFileImage').removeClass('video-contain-ok');
        $('#videoCoverWrapper').hide();

        editObject.$formContainer.find(editObject.idStrFormImgList).empty();
        editObject.$formContainer.find('article').empty();
        editObject.$formContainer.find('input[type=text],input[type=hidden],textarea').val('');
        editObject.$formContainer.find('.from-is-checkbox :checkbox').bootstrapSwitch('state', false);

        editObject.$formContainer.find(editObject.idStrHeaderBar).children('[aria-controls=baseInfoBox]').addClass('active').siblings().removeClass('active');
        editObject.$formContainer.find('.group-base-wrapper').show().siblings('.tab-pane').hide();
    }



    /*
    * 查看
    * */
    var $viewFormContainer = $('#viewFormContainer');
    function showView(id) {
        if(!id) return;
        ajax.getAjaxData({
            url: 'merchant/shops/' + shopInfoData.shop_id + '/products/' + id,
            success: function (data) {
                // console.log('view data:', data);
                data.product.is_deleted_text = data.product.is_deleted ? '已禁用' : '否';
                data.product.is_marketable_text = data.product.is_marketable ? '是' : '已下架';
                data.product.is_list_text = data.product.is_list ? '是' : '否';

                if(!data.video_cover_src_string) {
                    $('#videoImageWrapper').hide().siblings().show();
                } else {
                    $('#videoImageWrapper').show().siblings().hide();
                }

                if(data.imgs.length) {
                    $viewFormContainer.find('.form-img-list').html( template('viewPhotosTemplate', { result: data.imgs }) ).show().siblings().hide();
                } else {
                    $viewFormContainer.find('.form-img-list').empty().hide().siblings().show();
                }

                shopBase.setDataBinds(data.product, $viewFormContainer);

                data.videotexList.sort(function (a, b) {
                    return a.videotex_seq - b.videotex_seq;
                });
                $viewFormContainer.find('#viewContentTable>tbody').html( template('viewViewContentTemplate', {
                    result:data.videotexList, defaultImageUrl: defaultImageUrl
                }) );

                $viewFormContainer.show().siblings('.page-list-container').hide();
            }
        });
    }

    $viewFormContainer.find('.btn-close').on('click', function () {
        $viewFormContainer.hide().siblings('.page-list-container').show();
    });

});