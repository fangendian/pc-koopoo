/**
 * Created by gen on 2017/6/1.
 */

shopBase.getShopInfo(function (shopInfoData) {
    var defaultImageUrl = config.getDefImgUrl();
    var idStrListTable = '#categoriesTable';
    var $listTools = $('#listTools');

    //分类列表
    var pageLoader = new PagesLoader({
        url: 'merchant/shops/'+ shopInfoData.shop_id +'/specifications/list',
        pageBarIdString: '#pageNavWrapper',
        autoLoad: true,
        success: function (data) {
            $(idStrListTable +'>tbody').html(template('listTemplate', data));
            if(data.result.length) {
                $listTools.show();
            } else {
                $listTools.hide();
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
    })
    .siblings('thead').on('change', ':checkbox', function () { //全选
        var checked = !$(this)[0].checked;
        var $tbody = $(this).getParentByTagName('thead').siblings('tbody');
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
    $listTools.on('click', '#btnListRemove', function () {
        getIdList('确定要禁用吗？', function (idList) {
            ajax.deleteAjaxData({
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/specifications?items='+ idList.join(','),
                success: function () {
                    pageLoader.resetThenRequest();
                    $(this).remove();
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



    /*
    * 新增、修改
    * */
    var $formContainer = $('#formContainer');
    var $currentTarget = null;
    var idStrInputFile = '#fileUploadImage';
    var strEditContentTemplate = 'editContentTemplate';
    var specificationId;
    var editMode; //'new':新增, 'edit':修改

    shopBase.initFileUpload({
        fileInputId: '#fileUploadImage',
        maxFileSize: 1024 * 1024,
        success: function (result) {
            if($currentTarget) {
                $currentTarget.find('.image-contain').css('background-image', 'url('+ result.file_url +')');
                $currentTarget.find('input[name=img_src]').val(result.file_name);
            }
        }
    });

    //初始化是否禁用开关
    $formContainer.find('.from-is-deleted :checkbox').bootstrapSwitch();


    /*
    * 新增
    * */
    $('#btnShowAddBox').on('click', function () {
        editMode = 'new';
        $formContainer.show().siblings('.page-list-container').hide();
        $formContainer.find('.from-is-deleted').hide(); //隐藏是否禁用
        $(template(strEditContentTemplate, {
            result: [{}], defaultImageUrl: defaultImageUrl
        })).appendTo($formContainer.find('article'));
    });


    //内容模块的控制
    $formContainer.on('click', '.btn-add-content', function () {
        $(template(strEditContentTemplate, {
            result: [{}], defaultImageUrl: defaultImageUrl, display: 'none'
        })).insertAfter($(this).getParentByTagName('section')).slideToggle();
    })
    .on('click', '.btn-remove-content', function () {
        var $section = $(this).getParentByTagName('section');
        if($section.siblings('section').length) {
            var data = {};
            $section.find('input[name]').each(function () {
                data[$(this).attr('name')] = $(this).val();
            });
            if(data && (data.name || data.img_src)) {
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
                type: 3, content: '至少要有一个规格!'
            });
        }
    })
    .on('click', '.btn-file', function () {

        $currentTarget = $(this).getParentByClassName('form-item-content');
        $(idStrInputFile).trigger('click');
    });

    //保存数据
    $('#btnFormSubmit').on('click', function () {
        if(editMode == 'edit' && !specificationId) return;

        var data = shopBase.getAndVerificationData($formContainer.find('.group-base-wrapper'));
        if(!data) return;

        var specificationValues = [];
        $formContainer.find('section').each(function () {
            var itemData = shopBase.getAndVerificationData($(this));
            if(itemData) {
                specificationValues.push(itemData);
            } else {
                return false;
            }
        });

        if(!specificationValues.length) return;

        data.type = 1;
        data.specificationValues = specificationValues;

        if(editMode == 'new') { //新增
            ajax.postAjaxData({
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/specifications',
                data: data,
                success: function () {
                    pageLoader.resetThenRequest();
                    resetFormContent();
                }
            })
        } else { //修改
            data.is_deleted = $formContainer.find('.from-is-deleted :checkbox')[0].checked;
            ajax.putAjaxData({
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/specifications/'+ specificationId,
                data: data,
                success: function () {
                    pageLoader.resetThenRequest();
                    resetFormContent();
                }
            })
        }
    });

    $('#btnFormCancel').on('click', function () {
        var data = {
            base: {}, values: {}
        };
        $formContainer.find('.group-base-wrapper').find('input[name],textarea').each(function () {
            if($(this).attr('type') != 'checkbox') data.base[$(this).attr('name')] = $(this).val();
        });

        $formContainer.find('article input[name]').each(function () {
            data.values[$(this).attr('name')] = $(this).val();
        });
        var hasContent = false;
        for(var key in data.base) {
            if(data.base[key]) {
                hasContent = true;
                break;
            }
        }

        for(var key2 in data.values) {
            if(data.values[key2]) {
                hasContent = true;
                break;
            }
        }
        if(hasContent) {
            app.confirm({
                title: '确定取消吗?',
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
    * 修改
    * */
    function showEdit(id){
        if(!id) return;
        ajax.getAjaxData({
            url: 'merchant/shops/' + shopInfoData.shop_id + '/specifications/' + id,
            success: function (data) {
                console.log(data);
                editMode = 'edit';
                specificationId = id;

                $formContainer.find('.from-is-deleted').show()
                    .find(':checkbox').bootstrapSwitch('state', data.specification.is_deleted); //显示是否禁用
                $formContainer.show().siblings('.page-list-container').hide();

                shopBase.setDataBinds(data.specification, $formContainer.find('.group-base-wrapper'));
                $formContainer.find('article').html( $(template(strEditContentTemplate, {
                    result: data.specificationValues,
                    defaultImageUrl: defaultImageUrl
                })) );
            }
        });

    }


    function resetFormContent() {
        editMode = '';
        specificationId = null;
        $currentTarget = null;

        $formContainer.hide().siblings('.page-list-container').show();
        $formContainer.children('form').resetForm().find('textarea').empty();
        $formContainer.find('article').empty();
    }



    /*
    * 查看
    * */
    var $viewFormContainer = $('#viewFormContainer');
    function showView(id) {
        if(!id) return;
        ajax.getAjaxData({
            url: 'merchant/shops/' + shopInfoData.shop_id + '/specifications/' + id,
            success: function (data) {
                console.log(data);
                shopBase.setDataBinds(data.specification, $viewFormContainer.find('.form-view-base'));
                $viewFormContainer.find('table>tbody').html( $(template('viewContentTemplate', {
                    result: data.specificationValues,
                    defaultImageUrl: defaultImageUrl
                })) );

                $viewFormContainer.show().siblings('.page-list-container').hide();
            }
        });
    }

    $('#btnViewFormClose').on('click', function () {
        $viewFormContainer.hide().siblings('.page-list-container').show();
    });

});