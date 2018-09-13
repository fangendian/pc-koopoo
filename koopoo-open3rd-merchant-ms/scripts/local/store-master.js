/**
 * Created by gen on 2017/6/2.
 */

shopBase.getShopInfo(function (shopInfoData) {
    var defaultImageUrl = config.getDefImgUrl();
    var idStrListTable = '#listTable';
    var $listTools = $('#listTools');


    //列表
    var pageLoader = new PagesLoader({
        url: 'merchant/shops/'+ shopInfoData.shop_id +'/hairstylists/list',
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
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/hairstylists?items='+ idList.join(','),
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



    var ___data = {
        template_id: shopInfoData.template_id
    };

    //根据不同的模板区分处理
    switch (shopInfoData.template_id) {
        case 4:
            ___data.master_type = '发型师';
            break;
        case 17:
            ___data.master_type = '摄影师';
            break;
        default:
            break;
    }

    shopBase.setDataBinds(___data);



    /*
     * 新增、修改
     * */
    var __verificationData; //临时待保存的数据

    var editObject = {
        $formContainer: $('#formContainer'),
        $currentTarget: null,
        defaultImageUrl: defaultImageUrl,
        idStrHeaderBar: '#editHeaderBar',
        idStrInputFile: '#fileUploadImage',
        idStrContentArticle: 'article.videotex-list',
        idStrContentFile: '#fileUploadImagesForContent',
        idStrFormImgList: '#formImgList',
        isChange: false, //内容是否更改，用于取消提醒
        isFirstEdit: true, //第一次编辑
        strEditProjectTemplate: 'editProjectsTemplate',
        strEditContentTemplate: 'editContent_2_Template',
        editMode: '', //'new':新增, 'edit':修改
        productId: null,
        categoryId: null,
        categoriesData: null
    };


    //初始化上传封面或内容图片
    shopBase.initFileUpload({
        fileInputId: editObject.idStrInputFile,
        maxFileSize: 1024 * 1024,
        success: function (result) {
            if(editObject.$currentTarget) {
                editObject.$currentTarget.find('.image-contain').css('background-image', 'url('+ result.file_url +')');
                editObject.$currentTarget.find('input[name=cover_src], input[name=videotex_picture_src]').val(result.file_name);
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


    /*
     * 新增
     * */
    $('#btnShowAddBox').on('click', function () {
        $('#editTile').children('[data-mode=new]').show().siblings().hide();

        editObject.editMode = 'new';
        editObject.isFirstEdit = false;
        editObject.$formContainer.show().siblings('.page-list-container').hide();

        $('#shopCoverImg').css('background-image', 'url('+ defaultImageUrl +')');

        //套餐
        $(template(editObject.strEditProjectTemplate, { result: [{}] })).appendTo(editObject.$formContainer.find('article.project-list')).slideToggle(0);

        //图文内容
        $(template(editObject.strEditContentTemplate, {
            result: [{type: 'content'}], defaultImageUrl: defaultImageUrl
        })).appendTo(editObject.$formContainer.find('article.videotex-list')).slideToggle(0);

        $(editObject.idStrFormImgList).siblings('.img-thumbnail').show();
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
     * 上传图集
     * */
    //初始化上传图集
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
     * 服务套餐模块
     * */
    editObject.$formContainer.find('article.project-list').on('click', '.btn-control', function () {
        var mode = $(this).data('mode');
        var $section = $(this).getParentByTagName('section');
        if(mode === 'add') {
            $(template(editObject.strEditProjectTemplate, { result: [{}], display: 'none' } )).insertAfter($section).slideToggle();
        } else { //remove
            if($section.siblings('section').length) {
                var name = $section.find('input[name=name]').val(),
                    price = $section.find('input[name=price]').val();
                if(name || price) {
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
                    type: 3, content: '至少要有一个套餐!'
                });
            }
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
        if(editObject.editMode === 'edit' && !editObject.hairdresserId) return;
        var data = verificationData(); //收集基本信息
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
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/hairstylists',
                data: data,
                success: function () {
                    pageLoader.resetThenRequest();
                    resetFormContent();
                }
            })
        } else { //修改
            ajax.putAjaxData({
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/hairstylists/'+ editObject.hairdresserId,
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

        var errorText;

        //服务套餐
        var projects = [];
        editObject.$formContainer.find('article.project-list>section').each(function () {
            var __data = shopBase.getAndVerificationData($(this), true, false);
            if(__data) {
                projects.push(__data);
            } else {
                var name = $(this).find('input[name=name]').val(),
                    price = $(this).find('input[name=price]').val();
                if(name || price) { //有未完成的项
                    errorText = '有未完成的项';
                    return false;
                }
            }
        });
        if(projects.length) {
            data.service_project = JSON.stringify(projects);
        }
        if(errorText) return;

        //图集
        var images = [];
        $(editObject.idStrFormImgList).children('li').each(function () {
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
            url: 'merchant/shops/' + shopInfoData.shop_id + '/hairstylists/' + id,
            success: function (data) {
                // console.log('get product:', data);
                editObject.editMode = 'edit';
                editObject.hairdresserId = id;
                editObject.isFirstEdit = true;

                /*
                 * 填充数据
                 * */
                data.videotexList.sort(function (a, b) {
                    return a.videotex_seq - b.videotex_seq;
                });
                var serviceProject = data.service_project ? JSON.parse(data.service_project) : null;

                $(template(editObject.strEditProjectTemplate, {
                        result: serviceProject || [{}], display: 'block'
                } )).appendTo(editObject.$formContainer.find('article.project-list'));

                $(template(editObject.strEditContentTemplate, {
                    result: data.videotexList.length ? data.videotexList : [{type: 'content'}],
                    defaultImageUrl: defaultImageUrl,
                    display: 'block'
                })).appendTo(editObject.$formContainer.find('article.videotex-list'));

                var $groupBaseWrapper = editObject.$formContainer.find('.group-base-wrapper');
                shopBase.setDataBinds(data, $groupBaseWrapper);

                if(data.imgs && data.imgs.length){
                    editObject.$formContainer.find(editObject.idStrFormImgList).html(template('photosTemplate', { result: data.imgs} ))
                        .siblings('.img-thumbnail').hide();

                }
                //设置开关控件
                editObject.$formContainer.find('.from-is-checkbox :checkbox').each(function () {
                    $(this).bootstrapSwitch('state', data[$(this).attr('name')]);
                });

                editObject.$formContainer.show().siblings('.page-list-container').hide();
            }
        });
    }


    /*
     * 重置表单及内容
     * */
    function resetFormContent() {
        editObject.editMode = '';
        editObject.hairdresserId = null;
        editObject.categoryId = null;
        editObject.$currentTarget = null;
        __verificationData = null;
        editObject.isChange = false;

        editObject.$formContainer.hide().siblings('.page-list-container').show();

        editObject.$formContainer.find(editObject.idStrFormImgList).empty();
        editObject.$formContainer.find('article').empty();
        editObject.$formContainer.find('input[type=text],textarea').val('');
        editObject.$formContainer.find('input:checkbox, input:radio').each(function (item) {
            $(this)[0].checked = false;
        });
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
            url: 'merchant/shops/' + shopInfoData.shop_id + '/hairstylists/' + id,
            success: function (data) {
                // console.log('view data:', data);

                data.is_deleted_text = data.is_deleted ? '已禁用' : '否';

                if(data.service_project) {
                    var projects = JSON.parse(data.service_project);
                    console.log(projects);
                    $viewFormContainer.find('ul.view-project-list').html( template('viewProjectsTemplate', { result: projects }) ).show().siblings().hide();
                } else {
                    $viewFormContainer.find('ul.view-project-list').empty().hide().siblings().show();
                }

                if(data.imgs.length) {
                    $viewFormContainer.find('.form-img-list').html( template('viewPhotosTemplate', { result: data.imgs }) ).show().siblings().hide();
                } else {
                    $viewFormContainer.find('.form-img-list').empty().hide().siblings().show();
                }

                shopBase.setDataBinds(data, $viewFormContainer);

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