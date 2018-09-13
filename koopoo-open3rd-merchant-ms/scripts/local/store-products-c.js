/**
 * Created by gen on 2017/6/2.
 *
 * 商品需要选择分类的模式
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
     * 根据不同模板作出相应处理
     *
     * */

    var ___data = {
        sizeStr: '750 &times; 500px'
    };
    var idStrLabelSpecificationMultiple = '#labelSpecificationMultiple';
    switch (shopInfoData.template_id) {
        case 6: //食品
            $('#boxSubName, #boxViewSubName').show();
            break;
        case 16: //婚庆
            ___data.tipText = '如果您的商品需要在首页展示，请关联至主题';
            $(idStrLabelSpecificationMultiple).show();
            break;
        case 17: //摄影
            $('#boxSubName, #boxViewSubName').show();
            ___data.tipText = '如果您的商品需要在首页展示，请关联至主题';
            break;
        case 4: //美容美发
        case 8: //艺术品
        case 14: //居家生活
            $(idStrLabelSpecificationMultiple).show();
            break;
        case 18: //美酒
            ___data.sizeStr = '750 &times; 375px';
            $(idStrLabelSpecificationMultiple).show();
            break;
        case 19: //母婴
            ___data.tipText = '如果商品需要在首页展示，请关联至第一个主题';
            $(idStrLabelSpecificationMultiple).show();
            break;
        case 7: //时尚商铺
        case 9: //鲜花
            $('#boxSubName, #boxViewSubName, '+ idStrLabelSpecificationMultiple).show();
            break;
        default:
            break;
    }

    shopBase.setDataBinds(___data);
    if(___data.tipText) {
        $('#listTip').show();
    }





    /*
    * 新增、修改
    * */
    var specificationsAllData, //规格所有数据
        selectedListData; //当前选中的规格组
    var __verificationData; //临时待保存的数据

    //初始化上传封面或内容图片
    var editObject = {
        $formContainer: $('#formContainer'),
        $currentTarget: null,
        defaultImageUrl: defaultImageUrl,
        idStrHeaderBar: '#editHeaderBar',
        idStrInputFile: '#fileUploadImage',
        idStrCategoriesUl: '#categoriesUl',
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


    function setCategoriesData(callback) {
        if(!editObject.categoriesData) {
            ajax.getAjaxData({
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/products/categorys/list',
                data: {
                    pageSize: 10000
                },
                success: function (data) {
                    $(editObject.idStrCategoriesUl).html(template('categoriesTemplate', data));
                    editObject.categoriesData = data.result;
                    if(callback) callback(editObject.categoriesData);
                }
            });
        } else {
            $(editObject.idStrCategoriesUl).children().removeClass('active');
            if(callback) callback(editObject.categoriesData);
        }
    }


    /*
    * 新增
    * */
    $('#btnShowAddBox').on('click', function () {
        // getCategoriesData();
        getSpecificationsAllDataByAjax(function () {
            if(specificationsAllData && specificationsAllData.length) {
                showHtml();
            } else {
                /*app.confirm({
                    content: '您还未创建任何规格，是否前往创建？',
                    otherButtons: ['取消', '前往'],
                    otherButtonStyles: ['btn-default', 'btn-primary'],
                    callback: function () {
                        top.nav.gotoAndClickItem({ id: '1-2' });
                    },
                    cancelCallback: showHtml
                })*/
                showHtml(); //Test!!!
            }

            function showHtml() {
                $('#editTile').children('[data-mode=new]').show().siblings().hide();

                editObject.editMode = 'new';
                editObject.isFirstEdit = false;
                editObject.$formContainer.show().siblings('.page-list-container').hide();

                editObject.$formContainer.find('#categoriesBox').show().siblings('.tab-pane').hide();
                $('#shopCoverImg').css('background-image', 'url('+ defaultImageUrl +')');

                $(template(editObject.strEditContentTemplate, {
                    result: [{type: 'content'}], defaultImageUrl: defaultImageUrl
                })).appendTo(editObject.$formContainer.find('article')).slideToggle(0);

                $(editObject.idStrFormImgList).siblings('.img-thumbnail').show();
                setCategoriesData();
            }
        });
    });


    //选择菜品分类
    $(editObject.idStrCategoriesUl).on('click', 'li', function () {
        var id = $(this).data('id');
        if(!id || $(this).hasClass('active')) return;

        editObject.categoryId = id;
        $(this).addClass('active').siblings().removeClass('active');
        $(editObject.idStrHeaderBar).children().eq(1).removeClass('disabled');
        $('#btnNextToStep2').removeAttr('disabled');
        $('#selectedCategory').text($(this).text()).siblings('input').val(id);
    });

    //进入第二步
    $('#btnNextToStep2').on('click', function () {
        editObject.isChange = true;
        $(editObject.idStrHeaderBar).children('[aria-controls=baseInfoBox]').trigger('click');
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
    * 规格
    * */
    var $specificationsUl = $('#specificationsUl'), //规格列表
        $specificationsValuesUl = $('#specificationsValuesUl'), //规格值列表
        $specificationsValuesTable = $('#specificationsValuesTable');
    //选择规格模式
    editObject.$formContainer.find(':radio[name=is_unified_spec]').on('change', function () {
        var value = $(this).val();
        if(value == 1) { //多规格
            getSpecificationsAllData();
        } else if(value == 0) { //统一规格
            var timing = editObject.isFirstEdit ? 0 : 300;
            editObject.$formContainer.find('.edit-spec-multiple-box').slideUp(timing)
                .siblings('.edit-spec-single-box').slideDown(timing);
        }
    });

    //获取所有规格值列表并设置页面
    function getSpecificationsAllData(callback) {
        getSpecificationsAllDataByAjax(function () {
            if(!$specificationsUl.children().length) {
                $specificationsUl.html(template('specificationsTemplate', { result: specificationsAllData }) );
            }

            var timing = editObject.isFirstEdit ? 0 : 300;
            editObject.$formContainer.find('.edit-spec-multiple-box').slideDown(timing)
                .siblings('.edit-spec-single-box').slideUp(timing);

            if(callback) callback();
        });
    }

    //获取所有规格列表及所有值数据
    function getSpecificationsAllDataByAjax(callback) {
        if(!specificationsAllData) {
            ajax.getAjaxData({
                url: 'merchant/shops/' + shopInfoData.shop_id + '/specifications/all',
                data: {
                    pageSize: 1000
                },
                success: function (data) {
                    data.result.forEach(function (item) {
                        item.specification_id = item.specification.specification_id;
                    });
                    specificationsAllData = data.result;
                    if(callback) callback(specificationsAllData);
                }
            });
        } else {
            if(callback) callback(specificationsAllData);
        }
    }

    //选择多规格
    $specificationsUl.on('click', 'li', function () {
        if($(this).siblings('.active').length >= 3) {
            app.show({
                content: '最多只能选择3种规格', type: 3
            });
            return;
        }
        if($(this).hasClass('active')) {
            $(this).removeClass('active');
            $specificationsValuesUl.children('[data-id='+ $(this).data('id') +']').remove();

            setSpecValuesData();
        } else {
            var $prev = $(this).prevAll('.active').first();
            var data = shopBase.findItemInObjectArray(specificationsAllData, 'specification_id', $(this).data('id'));
            if(!data) return;

            $(this).addClass('active');
            if($prev.length) {
                $( template('specificationsValuesTemplate', { result: [data] }) ).insertAfter($specificationsValuesUl.children('[data-id='+ $prev.data('id') +']'));
            } else {
                $specificationsValuesUl.prepend( template('specificationsValuesTemplate', { result: [data] }) );
            }
        }

        //改变规格，最多三组规格
        selectedListData = []; //重置为空数组
        $specificationsUl.children('.active').each(function () {
            var data = shopBase.findItemInObjectArray(specificationsAllData, 'specification_id', $(this).data('id'));
            if(data) selectedListData.push($.extend(true, {}, data));
        });

        // console.log('改变规格', selectedListData);
    });

    //变更规格值
    $specificationsValuesUl.on('change', ':checkbox', function () {
        setSpecValuesData();
        editObject.isChange = true;
    });

    //设置并显示已选择的规格值表格
    function setSpecValuesData() {
        var __selectedGroupData = []; //已选择规格值的 - 组的列表
        var titles = [];

        $specificationsValuesUl.children('li').each(function (index) {
            var data = shopBase.findItemInObjectArray(specificationsAllData, 'specification_id', $(this).data('id'));
            if(!data) return;
            var name = $(this).data('name');
            var groupData;
            $(this).find(':checked').each(function () {
                var itemData = shopBase.findItemInObjectArray(data.specificationValues, 'specification_value_id', $(this).data('id') );
                if(itemData) {
                    if(!groupData) {
                        groupData = [];
                        titles.push(name);
                    }
                    groupData.push(itemData);
                }
            });
            if(groupData) __selectedGroupData.push(groupData);
        });

        var allListData = filterSelectedGroupToListData(__selectedGroupData);
        var $html = $(template('specificationsStockTemplate', {
            list: allListData, titles: titles
        }));
        setRowSpanOfTable($html, 0);
        if(titles.length > 2) setRowSpanOfTable($html, 1);

        $specificationsValuesTable.html( $html );
    }

    //将选中的规格值处理为->配额组合列表
    function filterSelectedGroupToListData(__selectedGroupData) {
        var allListData = [];
        if(__selectedGroupData[0]) {
            var index = 1;
            __selectedGroupData[0].forEach(function (item) {
                var value;
                if(!__selectedGroupData[index]) {
                    allListData.push({
                        specification_value: item.specification_value_id,
                        list: [item]
                    });
                    return;
                }

                __selectedGroupData[index].forEach(function (afterItem) {
                    if(__selectedGroupData[index+1]) {
                        __selectedGroupData[index+1].forEach(function (lastItem) {
                            value = item.specification_value_id +','+ afterItem.specification_value_id +','+ lastItem.specification_value_id;
                            allListData.push({
                                specification_value: value,
                                list: [item, afterItem, lastItem]
                            })
                        })
                    } else {
                        value = item.specification_value_id +','+ afterItem.specification_value_id;
                        allListData.push({
                            specification_value: value,
                            list:[item, afterItem]
                        });
                    }
                });
            });
        }
        return allListData;
    }

    //单列合并多行表格
    function setRowSpanOfTable($target, colIdx) {
        var that, rowspan, id;
        $('tr', $target).each(function(row) {
            if(!row) return;
            var $td = $('td:eq('+ colIdx +')', this);
            if (!!that && $td.text() == $(that).text()) {
                rowspan = $(that).attr("rowspan");

                if (rowspan == undefined) {
                    $(that).attr("rowspan", 1);
                    rowspan = 1;
                }
                rowspan = parseInt(rowspan) + 1;
                $td.hide();
                $(that).attr("rowspan", rowspan);
            } else {
                // id = 'r_'+ colIdx +'_'+ row;
                // $td.attr('data-rowspan-id', id);
                that = $td;
            }
            // $td.nextAll().attr('data-col-'+ colIdx, id);
        });
    }


    /*
    * 图文内容模块的控制
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
        if(videotexList.length < 1) {
            $(editObject.idStrHeaderBar).children('[aria-controls=contentBox]').trigger('click');
            app.show({
                content: '至少需要一组内容！', type: 3
            });
            return;
        } else {
            data.videotexList = videotexList;
        }

        // console.log('待提交的数据', data);
        var $btn = $(this).attr('disabled', 'disabled');
        if(editObject.editMode === 'new') { //新增
            ajax.postAjaxData({
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/products',
                data: data,
                success: function () {
                    pageLoader.resetThenRequest();
                    resetFormContent();
                },
                complete: complete
            })
        } else { //修改
            ajax.putAjaxData({
                url: 'merchant/shops/'+ shopInfoData.shop_id +'/products/'+ editObject.productId,
                data: data,
                success: function () {
                    pageLoader.resetThenRequest();
                    resetFormContent();
                },
                complete: complete
            })
        }

        function complete() {
            $btn.removeAttr('disabled');
        }
    });

    /*
    * 验证并且收集基本信息
    * */
    function verificationData(callback) {
        if(!editObject.categoriesData || !editObject.categoriesData.length) {
            app.show({ content: '抱歉缺少分类！', type: 3});
            return;
        }
        //基础信息
        var data = shopBase.getAndVerificationData('#baseInfoWrapper', true);
        if(!data) return;

        /*
         * 收集库存数据
         * */
        var is_unified_spec = $('input[name=is_unified_spec]:checked').val();
        if(!is_unified_spec) {
            app.show({
                content: '请先选择规格!', type: 3
            });
            return;
        }
        if (is_unified_spec == 1) { //多规格
            data.is_unified_spec = false;
            var $selectedSpecLi = $specificationsUl.children('.active');
            if ($selectedSpecLi.length) {
                var priceAndStock = []; //{value:'1 value, 2 value, 3 value'}
                var specificationIds = []; //parent-id
                var specificationValueIds = []; //规格值 value-id _ parent-id

                $selectedSpecLi.each(function () {
                    specificationIds.push($(this).data('id'));
                });

                $specificationsValuesUl.children('li').each(function () {
                    $(this).find(':checked').each(function () {
                        specificationValueIds.push($(this).data('id') + '_' + $(this).data('s-id'));
                    });
                });

                //收集不同规格的库存
                var error;
                $specificationsValuesTable.children('tbody').children('tr').each(function () {
                    var __data = shopBase.getAndVerificationData($(this), true);
                    if (!__data) {
                        error = true;
                        return false;
                    }
                    priceAndStock.push(__data);
                });

                if(!error && priceAndStock.length) {
                    data.priceAndStock = JSON.stringify(priceAndStock);
                    data.specificationIds = specificationIds;
                    data.specificationValueIds = specificationValueIds;
                } else {
                    app.show({
                        content: '请配置价格与库存!', type: 3
                    });
                    $('body').animate({scrollTop: editObject.$formContainer.find('.edit-spec-multiple-box').offset().top - 20}, 200);
                    return;
                }
            } else {
                app.show({
                    content: '当前为多规格模式，请设置规格！', type: 3
                });
                return;
            }
        } else { //统一规格
            var stockData = shopBase.getAndVerificationData(editObject.$formContainer.find('.edit-spec-single-box'), true);
            if (!stockData) return;
            data.is_unified_spec = true;
            $.extend(true, data, stockData);
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

        //商品信息
        /*var __shopInfoData = shopBase.getAndVerificationData('#shopInfoWrapper');
        if(!__shopInfoData) return;
        $.extend(true, data, __shopInfoData);*/
        data.is_list = true;

        //物流/其他
        var otherData = shopBase.getAndVerificationData('#shopOtherWrapper', true);
        if(!otherData) return;
        $.extend(true, data, otherData);
        data.delivery_type = 0; //统一物流
        if(!data.delivery_fees) data.delivery_fees = 0; //运费


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
            url: 'merchant/shops/' + shopInfoData.shop_id + '/products/' + id,
            success: function (data) {
                // console.log('get product:', data);
                editObject.editMode = 'edit';
                editObject.productId = id;
                editObject.isFirstEdit = true;

                /*
                * 填充数据
                * */
                data.videotexList.sort(function (a, b) {
                    return a.videotex_seq - b.videotex_seq;
                });
                $(template(editObject.strEditContentTemplate, {
                    result: data.videotexList.length ? data.videotexList : [{}],
                    defaultImageUrl: defaultImageUrl,
                    display: 'block'
                })).appendTo(editObject.$formContainer.find('article'));

                var $groupBaseWrapper = editObject.$formContainer.find('.group-base-wrapper');
                shopBase.setDataBinds(data.product, $groupBaseWrapper);

                if(data.imgs && data.imgs.length){
                    editObject.$formContainer.find(editObject.idStrFormImgList).html(template('photosTemplate', { result: data.imgs} ))
                        .siblings('.img-thumbnail').hide();

                }
                //设置开关控件
                editObject.$formContainer.find('.from-is-checkbox :checkbox').each(function () {
                    $(this).bootstrapSwitch('state', data.product[$(this).attr('name')]);
                });

                //获取并设置分类数据
                setCategoriesData(function () {
                    var categoryData = shopBase.findItemInObjectArray(editObject.categoriesData, 'product_category_id', data.product.product_category_id);
                    $('#selectedCategory').text(categoryData ? categoryData.name : '请返回选择').siblings('input').val(data.product.product_category_id); //分类名字
                    $(editObject.idStrCategoriesUl).children('[data-id='+ data.product.product_category_id +']').addClass('active');

                    editObject.$formContainer.find(editObject.idStrHeaderBar).children('[aria-controls=baseInfoBox]').attr('class', 'active').siblings().removeClass('active disabled');
                    $groupBaseWrapper.show().siblings('.tab-pane').hide();
                    $('#btnNextToStep2, #btnNextToStep3').removeAttr('disabled');

                    editObject.$formContainer.show().siblings('.page-list-container').hide();
                });

                //获取所有规格值
                if(data.product.is_unified_spec) {
                    editObject.$formContainer.find('input[name=is_unified_spec]').eq(0).trigger('click');
                    shopBase.setDataBinds(data.product, editObject.$formContainer.find('.edit-spec-single-box'));
                    editObject.isFirstEdit = false;
                } else {
                    getSpecificationsAllData(function () {
                        editObject.$formContainer.find('input[name=is_unified_spec]').eq(1).trigger('click');
                        setOldSpecValue(data, function (allListData, titles) {
                            $specificationsValuesUl.html( template('specificationsValuesTemplate', { result: selectedListData }) );
                            //设置组装表格内容
                            var $html = $(template('specificationsStockTemplate', {
                                list: allListData, titles: titles
                            }));
                            setRowSpanOfTable($html, 0);
                            if(titles.length > 2) setRowSpanOfTable($html, 1);

                            $specificationsValuesTable.html( $html );
                            editObject.isFirstEdit = false;
                        });
                    });
                }
            }
        });
    }

    //处理并显示已有的规格值的数据
    function setOldSpecValue(newData, callback, isView) {
        selectedListData = []; //重置为空数组

        //处理已有的值
        newData.specifications.forEach(function (item) {
            if(!isView) $specificationsUl.children('[data-id='+ item.specification_id +']').addClass('active');
            var data = shopBase.findItemInObjectArray(specificationsAllData, 'specification_id', item.specification_id);
            if(data) {
                selectedListData.push($.extend(true, {}, data));
            }
        });


        /*
        * 规格值列表
        * */
        var newValues = [];
        var __id, __index = 0;
        newData.specificationValues.forEach(function (item, index) {
            if(item.specification_id != __id) {
                if(index) __index++;
                newValues[__index] = {
                    specification_id: item.specification_id,
                    specificationValues: []
                };
            }
            __id = item.specification_id;
            newValues[__index].specificationValues.push(item);
        });

        /*
        * 遍历已选择的规格项
        * 组装已选择的项为新列表
        * */
        var titles = [];
        var __selectedGroupData = [];
        newValues.forEach(function (item) {
            var oldData = shopBase.findItemInObjectArray(selectedListData, 'specification_id', item.specification_id);
            if(oldData) {
                var groupData;
                //循环原始规格值
                item.specificationValues.forEach(function (valueItem) {
                    var oldValueData = shopBase.findItemInObjectArray(oldData.specificationValues, 'specification_value_id', valueItem.specification_value_id);
                    if(oldValueData) {
                        oldValueData.checked = true;
                        if(!groupData) {
                            groupData = [];
                            titles.push(oldData.specification.name);
                        }
                        groupData.push(oldValueData);

                    }
                });
                if(groupData) __selectedGroupData.push(groupData);
            }
        });

        var allListData = filterSelectedGroupToListData(__selectedGroupData);
        allListData.forEach(function (item) {
            newData.stocks.forEach(function (stockItem) {
                if(stockItem.specification_value == item.specification_value) {
                    item.price = stockItem.price;
                    item.stock = stockItem.stock;
                }
            });
        });

        if(callback instanceof Function) {
            callback(allListData, titles);
        }
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

        $('#selectedCategory').text('请返回选择');
        editObject.$formContainer.find(editObject.idStrHeaderBar).children('[aria-controls=categoriesBox]').addClass('active').siblings().removeClass('active').addClass('disabled');

        //规格内容
        editObject.$formContainer.find('.edit-spec-multiple-box, .edit-spec-single-box').hide();
        $specificationsUl.empty();
        $specificationsValuesUl.empty();
        $specificationsValuesTable.empty();

        editObject.$formContainer.find(editObject.idStrFormImgList).empty();
        editObject.$formContainer.find('article').empty();
        editObject.$formContainer.find('input[type=text],textarea').val('');
        editObject.$formContainer.find('input:checkbox, input:radio').each(function (item) {
            $(this)[0].checked = false;
        });
        editObject.$formContainer.find('.from-is-checkbox :checkbox').bootstrapSwitch('state', false);
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
                setCategoriesData(function (listData) {
                    var categoryData = shopBase.findItemInObjectArray(listData, 'product_category_id', data.product.product_category_id);
                    if(categoryData) {
                        $('#viewCategoryName').text(categoryData.name);
                    }
                });

                data.product.is_deleted_text = data.product.is_deleted ? '已禁用' : '否';
                data.product.is_marketable_text = data.product.is_marketable ? '是' : '已下架';
                data.product.is_list_text = data.product.is_list ? '是' : '否';

                if(data.imgs.length) {
                    $viewFormContainer.find('.form-img-list').html( template('viewPhotosTemplate', { result: data.imgs }) ).show().siblings().hide();
                } else {
                    $viewFormContainer.find('.form-img-list').empty().hide().siblings().show();
                }

                if(data.product.is_unified_spec) {
                    data.product.is_unified_spec_text = '统一规格';
                    $viewFormContainer.find('.view-spec-single-box').show().siblings('.view-spec-multiple-box').hide().find('table').empty();
                } else {
                    data.product.is_unified_spec_text = '多规格';
                    //获取所有规格值
                    getSpecificationsAllData(function () {
                        setOldSpecValue(data, function (allListData, titles) {
                            //设置组装表格内容
                            var $html = $(template('viewSpecificationsStockTemplate', {
                                list: allListData, titles: titles
                            }));
                            setRowSpanOfTable($html, 0);
                            if(titles.length > 2) setRowSpanOfTable($html, 1);

                            $viewFormContainer.find('.view-spec-multiple-box').show().find('table').html( $html );
                        }, true);
                    });
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