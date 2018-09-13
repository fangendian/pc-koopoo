/**
 * Created by gen on 2017/6/2.
 */

shopBase.getShopInfo(function (shopInfoData) {
    var defaultImageUrl = config.getDefImgUrl();
    var idStrListTable = '#listTable';
    var $listTools = $('#listTools');


    //分类列表
    var pageLoader = new PagesLoader({
        url: 'merchant/shops/'+ shopInfoData.shop_id +'/contents/list',
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
            showView(id, {
                title: $tr.find('.text-title').text(),
                is_deleted: $tr.data('is-deleted'),
                cover_src_string: $tr.find('.image-contain').css('background-image').replace(/^url\(\"|\"\)$/g, '')
            });
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
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/contents?items='+ idList.join(','),
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
    var $formContainer = $('#formContainer');
    var $currentTarget = null;
    var $formButtons = $('#formButtons');
    var idStrInputFile = '#fileUploadImage',
        idStrThemesUl = '#themesUl';
    var editMode; //'new':新增, 'edit':修改
    var contentId; //商品Id
    var themesData; //当前选中的规格组
    var isChange = false; //内容是否更改，用于取消提醒
    var isFirstEdit = true; //第一次编辑

    var __verificationData; //临时待保存的数据

    var uEditor; //编辑器对象


    //初始化上传封面或内容图片
    shopBase.initFileUpload({
        fileInputId: idStrInputFile,
        maxFileSize: 1024 * 1024,
        success: function (result) {
            if($currentTarget) {
                $currentTarget.find('.image-contain').css('background-image', 'url('+ result.file_url +')');
                $currentTarget.find('input[name=thumbnail_src]').val(result.file_name);
                isChange = true;
            }
        }
    });

    //初始化开关
    $formContainer.find('.from-is-checkbox :checkbox').bootstrapSwitch();
    $formContainer.find('input[name=is_can_comment]').on('switchChange.bootstrapSwitch', function (e, state) {
        if(state) {
            $('#isNeedAuditWrapper').show();
        } else {
            $('#isNeedAuditWrapper').hide().find('input').bootstrapSwitch('state', false);
        }
    });


    //上传封面
    $('#btnCoverImg').on('click', function () {
        $currentTarget = $(this).getParentByClassName('form-cover-wrapper');
        $(idStrInputFile).trigger('click');
    });


    function setThemesData(callback) {
        if(!themesData) {
            ajax.getAjaxData({
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/contents/themes/list',
                data: {
                    pageSize: 10000
                },
                success: function (data) {
                    $(idStrThemesUl).html(template('themesTemplate', data));
                    themesData = data.result;
                    if(callback) callback(themesData);
                },
                error: function () {
                    $(idStrThemesUl).html('<p>载入失败</p>');
                }
            });
        } else {
            $(idStrThemesUl).children().removeClass('active');
            if(callback) callback(themesData);
        }
    }

    /* 设置编辑器及相关处理 */
    function setUEditor(content) {
        if(uEditor) {
            if(typeof content === 'string') {
                // uEditor.execCommand('inserthtml', content);
                uEditor.setContent(content);
            }
            return;
        }

        // createUEditorUI('插入文章'); //创建编辑器的插入商品插件

        uEditor = UE.getEditor('articleEditor', {
            initialFrameWidth : 680, //编辑区域宽度
            initialFrameHeight : 480, //编辑区域高度
            initialCodeMirrorHeight: 500, //源码编辑区域的高度
            elementPathEnabled : false,
            templateId: shopInfoData.template_id,
            shopId: shopInfoData.shop_id,
            customFilter: false //是否过滤复杂的内容结构, 针对微信小程序
        });
        if(typeof content === 'string') {
            uEditor.addListener('ready', function() {
                uEditor.setContent(content);
                // uEditor.execCommand( 'focus' );
            });
        }

        //处理按钮栏
        $(window).on('scroll', function () {
            if(window.pageYOffset > 30) {
                $formButtons.addClass('fixed');
            } else {
                $formButtons.removeClass('fixed');
            }
        });

        $formContainer.find('.form-to-top').on('click', function () {
            $('body,html').animate({ scrollTop: 0});
        });
    }


    /*
    * 新增
    * */
    $('#btnShowAddBox').on('click', function () {
        $('#editTile').children('[data-mode=new]').show().siblings().hide();

        editMode = 'new';
        isFirstEdit = false;
        $formContainer.show().siblings('.page-list-container').hide();

        $('#shopCoverImg').css('background-image', 'url('+ defaultImageUrl +')');

        setThemesData();
        setUEditor();
    });


    //选择专题
    $(idStrThemesUl).on('click', 'li', function () {
        if($(this).data('id')) {
            $(this).toggleClass('active');
        }
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
    * 保存数据
    * */
    $('#btnFormSubmit').on('click', function () {
        if(editMode === 'edit' && !contentId) return;
        var data = shopBase.getAndVerificationData('#editTitle', true);
        if(!data) return;


        /* 收集专题Id */
        var themeIdList = [];
        var $themesUl = $(idStrThemesUl);
        $themesUl.children('li.active').each(function () {
            themeIdList.push($(this).data('id'));
        });
        if(!themeIdList.length) {
            app.show({ content: '请选择专题！', type: 3 });
            $themesUl.animateCss('shake');
            $('body').animate({scrollTop: $themesUl.offset().top - 20}, 10);
            return;
        }
        data.content_theme_ids = themeIdList;


        var data2 = shopBase.getAndVerificationData('#editRight', true);
        if(!data2) return;
        $.extend(true, data, data2);

        /* 获取并解析富文本 */
        var html = uEditor.getContent();

        if(!html) {
            app.show({ content: '内容不能为空！', type: 3 });
            return;
        }

        var $html = $(html);
        var nodes = [];
        $html.each(function() {
            var node = {};
            transformUECode($(this), node);
            nodes.push(node);
        });

        data.text = html;
        data.wxaapp_text = JSON.stringify(nodes);
        // console.log('nodes', nodes);

        // console.log('待提交的数据', JSON.stringify(data));
        if(editMode === 'new') { //新增
            ajax.postAjaxData({
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/contents',
                data: data,
                success: function () {
                    pageLoader.resetThenRequest();
                    resetFormContent();
                }
            })
        } else { //修改
            ajax.putAjaxData({
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/contents/'+ contentId,
                data: data,
                success: function () {
                    pageLoader.resetThenRequest();
                    resetFormContent();
                }
            })
        }
    });



    /*
    * 修改
    * */
    function showEdit(id){
        if(!id) return;
        $('#editTile').children('[data-mode=edit]').show().siblings().hide();
        ajax.getAjaxData({
            url: 'merchant/shops/' + shopInfoData.shop_id + '/contents/' + id,
            success: setContentForEdit
        });
    }

    function setContentForEdit(data) {
        editMode = 'edit';
        contentId = data.content.content_id;
        isFirstEdit = true;

        /*
         * 填充数据
         * */
        shopBase.setDataBinds(data.content, $formContainer);
        $formContainer.show().siblings('.page-list-container').hide();

        setUEditor(data.content.text.replace(/data-src=/g, 'src='));

        //设置开关控件
        $formContainer.find('.from-is-checkbox :checkbox').each(function () {
            $(this).bootstrapSwitch('state', data.content[$(this).attr('name')]);
        });

        //获取并设置分类数据
        setThemesData(function (themesData) {
            var $themesUl = $(idStrThemesUl);
            data.contentThemes.forEach(function (item) {
                $themesUl.children('li[data-id=' + item.content_theme_id + ']').addClass('active');
            })
        });
    }

    /*
    * 重置表单及内容
    * */
    function resetFormContent() {
        editMode = '';
        contentId = null;
        $currentTarget = null;
        __verificationData = null;
        isChange = false;

        $formContainer.hide().siblings('.page-list-container').show();


        //规格内容
        $formContainer.find('.edit-spec-multiple-box, .edit-spec-single-box').hide();

        uEditor.setContent('');
        uEditor.reset();
        if(uEditor.queryCommandState('source') === 1) {
            uEditor.execCommand('source');
        }
        $formContainer.find('article').empty();
        $formContainer.find('input[type=text],textarea').val('');
        $formContainer.find('input:checkbox').each(function (item) {
            $(this)[0].checked = false;
        });
        $formContainer.find('.from-is-checkbox :checkbox').bootstrapSwitch('state', false);
    }



    /*
    * 查看评论
    * */
    var $viewFormContainer = $('#viewFormContainer');
    var $commentsTable = $('#commentsTable');
    function showView(id, contentData) {
        if(!id) return;

        contentData.is_deleted_text = contentData.is_deleted ? '已禁用' : '否';
        shopBase.setDataBinds(contentData, $viewFormContainer);

        //查询文章评论
        ajax.getAjaxData({
            url: 'merchant/shops/' + shopInfoData.shop_id + '/contents/'+ id +'/comment',
            success: function (data) {
                data.defaultImageUrl = defaultImageUrl;
                // $commentsTable.children('tbody').html(template('commentsListTemplate', data));

                $viewFormContainer.show().siblings('.page-list-container').hide();
            }
        });
    }

    $viewFormContainer.find('.btn-close').on('click', function () {
        $viewFormContainer.hide().siblings('.page-list-container').show();
    });



    /*
     * 采集 - 单篇公众号文章
     * */
    var $wxArticleEditContainer = $('#wxArticleEditContainer');

    $('#btnShowAddBoxByWx').on('click', function () {
        $wxArticleEditContainer.show().siblings('.page-list-container').hide();
    });

    $('#btnFetchContentByWxUrl').on('click', function () {
        var data = shopBase.getAndVerificationData($(this).getParentByClassName('batch-input-wrapper'));
        if(!data) return;

        var $btn = $(this).attr('disabled', 'disabled');
        $btn.siblings('button').attr('disabled', 'disabled');
        ajax.postAjaxData({
            url: 'merchant/shops/'+ shopInfoData.shop_id +'/contents/wx/gather/single',
            data: data,
            success: function (contentData) {
                if(!contentData) {
                    app.show({
                        content: '没有查找到内容！', type: 5
                    });
                    return;
                }
                $wxArticleEditContainer.hide().find('input,textarea').val('');
                setContentForEdit(contentData);
            },
            complete: function () {
                $btn.removeAttr('disabled').siblings('button').removeAttr('disabled');
            }
        });
    });

    //取消单篇采集
    $('#btnFetchWxCancel').on('click', function () {
        $wxArticleEditContainer.hide().siblings('.page-list-container').show();
        $wxArticleEditContainer.find('input,textarea').val('');
        $wxArticleEditContainer.find('button').removeAttr('disabled');
    });

});