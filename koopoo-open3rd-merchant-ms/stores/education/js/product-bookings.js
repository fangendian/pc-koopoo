/**
 * Created by gen on 2017/6/2.
 */

shopBase.getShopInfo(function (shopInfoData) {
    var defaultImageUrl = config.getDefImgUrl();
    var idStrListTable = '#listTable';
    var $listTools = $('#listTools');


    //分类列表
    var pageLoader = new PagesLoader({
        url: 'merchant/shops/'+ shopInfoData.shop_id +'/courses/list',
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
        getIdList('确定要禁用吗？', function (idList, $trs) {
            ajax.deleteAjaxData({
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/courses?items='+ idList.join(','),
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
    var $formContainer = $('#formContainer');
    var $currentTarget = null;
    var idStrHeaderBar = '#editHeaderBar',
        idStrInputFile = '#fileUploadImage',
        idStrFormImgList = '#formImgList';
    var strEditContentTemplate = 'editContent_2_Template';
    var editMode; //'new':新增, 'edit':修改
    var postId; //商品Id
    var categoryId;
    var isChange = false; //内容是否更改，用于取消提醒
    var isFirstEdit = true; //第一次编辑

    var __verificationData; //临时待保存的数据


    //初始化上传封面或内容图片
    shopBase.initFileUpload({
        fileInputId: idStrInputFile,
        maxFileSize: 1024 * 1024,
        success: function (result) {
            if($currentTarget) {
                $currentTarget.find('.image-contain').css('background-image', 'url('+ result.file_url +')');
                $currentTarget.find('input[name=cover_src], input[name=videotex_picture_src], input[name=video_cover_src]').val(result.file_name);
                isChange = true;
            }
        }
    });

    //初始化是否禁用开关
    $formContainer.find('.from-is-checkbox :checkbox').bootstrapSwitch();

    //填写步骤进度
    $(idStrHeaderBar).on('click', 'li', function () {
        if($(this).hasClass('disabled') || $(this).hasClass('active')) return;

        $(this).addClass('active').siblings().removeClass('active');
        $('#'+ $(this).attr('aria-controls')).show().siblings().hide();
    });

    //上传封面
    $('#btnCoverImg').on('click', function () {
        $currentTarget = $(this).getParentByClassName('form-item-content');
        $(idStrInputFile).trigger('click');
    });


    /*
     * 新增
     * */
    $('#btnShowAddBox').on('click', function () {
        $('#editTile').children('[data-mode=new]').show().siblings().hide();

        editMode = 'new';
        isFirstEdit = false;
        $formContainer.show().siblings('.page-list-container').hide();

        $('#shopCoverImg, #videoCoverImg').css('background-image', 'url('+ defaultImageUrl +')');

        //图文内容
        $(template(strEditContentTemplate, {
            result: [{}], defaultImageUrl: defaultImageUrl
        })).appendTo($formContainer.find('article.videotex-list')).slideToggle(0);

        $(idStrFormImgList).siblings('.img-thumbnail').show();
    });


    //点击取消
    $formContainer.find('button.btn-cancel').on('click', function () {
        if(isChange) {
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
            isChange = true;
            $('#videoFileImage').addClass('video-contain-ok').getParentByClassName('form-item-content').find('input[name=video_src]').val(result.file_name);
            $('#videoCoverWrapper').show();
        }
    });

    $('#btnVideoCoverImg').on('click', function () {
        $currentTarget = $(this).getParentByClassName('form-item-content');
        $(idStrInputFile).trigger('click');
    });


    /*
     * 上传图集
     * */
    //初始化上传图集
    shopBase.initFileUpload({
        fileInputId: '#fileImages',
        maxFileSize: 1024 * 1024,
        success: function (result) {
            isChange = true;
            $(idStrFormImgList).append( template('photosTemplate', { result: [{
                file_resource_name: result.file_name, file_resource_name_string: result.file_url, defaultImageUrl: defaultImageUrl
            }]} ) ).siblings('.img-thumbnail').hide();
        }
    });

    //移除图集单个图片
    $(idStrFormImgList).on('click', '.fa-remove', function () {
        var $li = $(this).getParentByTagName('li');
        var length = $li.siblings().length;
        var $imgDefault = $(idStrFormImgList).siblings('.img-thumbnail');
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
    $formContainer.find('article.videotex-list').on('click', '.btn-file-single', function () { //触发上传图片(单张)
        $currentTarget = $(this).getParentByTagName('section');
        $(idStrInputFile).trigger('click');
    });

    //点击增加、移除功能
    $formContainer.find('article.videotex-list').on('click', '.btn-control', function () {
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
            default:
                break;
        }
        isChange = true;
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



    /*
     * 保存数据
     * */
    $('#btnFormSubmit').on('click', function () {
        if(editMode == 'edit' && !postId) return;
        var data = verificationData(); //收集基本信息
        if(!data) {
            $(idStrHeaderBar).children('[aria-controls=baseInfoBox]').trigger('click');
            return;
        }

        //收集内容
        var videotexList = [];
        var seqIndex = 0;
        $formContainer.find('article>section').each(function () {
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
        if(editMode == 'new') { //新增
            ajax.postAjaxData({
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/courses',
                data: data,
                success: function () {
                    pageLoader.resetThenRequest();
                    resetFormContent();
                }
            })
        } else { //修改
            ajax.putAjaxData({
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/courses/'+ postId,
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
        $(idStrFormImgList).children('li').each(function () {
            var __data = shopBase.getAndVerificationData($(this), true);
            if(__data) images.push(__data);
        });
        if(images.length) {
            data.imgs = images;
        }

        //备注
        var otherData = shopBase.getAndVerificationData('#editRemark', true);
        if(otherData) {
            $.extend(true, data, otherData);
        }

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
        ajax.getAjaxData({
            url: 'merchant/shops/' + shopInfoData.shop_id + '/courses/' + id,
            success: function (data) {
                // console.log('get product:', data);
                editMode = 'edit';
                postId = id;
                isFirstEdit = true;

                /*
                 * 填充数据
                 * */
                shopBase.setDataBinds(data, $formContainer.find('.group-base-wrapper'));

                if(data.video_cover_src) {
                    if(!data.video_cover_src_string) data.video_cover_src_string = defaultImageUrl;
                    shopBase.setDataBinds(data.product, '#videoInfoWrapper');
                    $('#videoFileImage').addClass('video-contain-ok');
                    $('#videoCoverWrapper').show();
                } else {
                    $('#videoCoverWrapper').hide();
                }

                data.videotexList.sort(function (a, b) {
                    return a.videotex_seq - b.videotex_seq;
                });
                $(template(strEditContentTemplate, {
                    result: data.videotexList.length ? data.videotexList : [{}],
                    defaultImageUrl: defaultImageUrl,
                    display: 'block'
                })).appendTo($formContainer.find('article.videotex-list'));

                if(data.imgs && data.imgs.length){
                    $formContainer.find(idStrFormImgList).html(template('photosTemplate', { result: data.imgs} ))
                        .siblings('.img-thumbnail').hide();

                }
                //设置开关控件
                $formContainer.find('.from-is-checkbox :checkbox').each(function () {
                    $(this).bootstrapSwitch('state', data[$(this).attr('name')]);
                });

                $formContainer.show().siblings('.page-list-container').hide();
            }
        });
    }


    /*
     * 重置表单及内容
     * */
    function resetFormContent() {
        editMode = '';
        postId = null;
        categoryId = null;
        $currentTarget = null;
        __verificationData = null;
        isChange = false;

        $formContainer.hide().siblings('.page-list-container').show();

        $('#videoFileImage').removeClass('video-contain-ok');
        $('#videoCoverWrapper').hide();

        $formContainer.find(idStrFormImgList).empty();
        $formContainer.find('article').empty();
        $formContainer.find('input[type=text],input[type=hidden],textarea').val('');
        $formContainer.find('input:checkbox').each(function () {
            $(this)[0].checked = false;
        });
        $formContainer.find('.from-is-checkbox :checkbox').bootstrapSwitch('state', false);

        $formContainer.find(idStrHeaderBar).children('[aria-controls=baseInfoBox]').addClass('active').siblings().removeClass('active');
        $formContainer.find('.group-base-wrapper').show().siblings('.tab-pane').hide();
    }



    /*
     * 查看
     * */
    var $viewFormContainer = $('#viewFormContainer');
    function showView(id) {
        if(!id) return;
        ajax.getAjaxData({
            url: 'merchant/shops/' + shopInfoData.shop_id + '/courses/' + id,
            success: function (data) {
                // console.log('view data:', data);

                data.is_deleted_text = data.is_deleted ? '已禁用' : '否';

                if(data.imgs.length) {
                    $viewFormContainer.find('.form-img-list').html( template('viewPhotosTemplate', { result: data.imgs }) ).show().siblings().hide();
                } else {
                    $viewFormContainer.find('.form-img-list').empty().hide().siblings().show();
                }

                shopBase.setDataBinds(data, $viewFormContainer);

                if(data.videotexList.length) {
                    data.videotexList.sort(function (a, b) {
                        return a.videotex_seq - b.videotex_seq;
                    });
                    $viewFormContainer.find('#viewContentTable>tbody').html( template('viewViewContentTemplate', {
                        result:data.videotexList, defaultImageUrl: defaultImageUrl
                    }) ).parent().show().siblings().hide();
                } else {
                    $viewFormContainer.find('#viewContentTable').hide().siblings().show();
                }

                $viewFormContainer.show().siblings('.page-list-container').hide();
            }
        });
    }

    $viewFormContainer.find('.btn-close').on('click', function () {
        $viewFormContainer.hide().siblings('.page-list-container').show();
    });

});