shopBase.getShopInfo(function (shopInfoData) {
	var urls = {
		themesList: 'merchant/shops/{shop_id}/contents/themes/list',
		postTheme: 'merchant/shops/{shop_id}/contents/themes/',
		getTheme: 'merchant/shops/{shop_id}/contents/themes/{content_theme_id}/',
		putTheme: 'merchant/shops/{shop_id}/contents/themes/{content_theme_id}/',
		getThemePr: 'merchant/shops/{shop_id}/contents/themes/{content_theme_id}/mapping',
        putProductPr: 'merchant/shops/{shop_id}/contents/themes/{content_theme_id}/mapping',
		getProductList: 'merchant/shops/{shop_id}/contents/list',
		uploadFile: 'merchant/files/upload/'
	};


	var defaultImageUrl = config.getDefImgUrl();
	var idStrListTable = '#listTable';
	var idStrFileUploadImage = '#fileUploadImage';
	var $listTools = $('#listTools');

	var allProductsData = null; //所有的商品列表临时数据



	//分类列表
	var pageLoader = new PagesLoader({
		url: app.getFullInfo(urls.themesList, {shop_id: shopInfoData.shop_id}),
		pageBarIdString: '#pageNavWrapper',
		autoLoad: true,
		success: function (data) {
			data.defaultImageUrl = defaultImageUrl;
			data.result.forEach(function (item) {
				item.start_time = new Date(item.start_time_long).format('yyyy-MM-dd HH:mm');
				item.end_time = new Date(item.end_time_long).format('yyyy-MM-dd HH:mm');
			});
            var $listTable = $(idStrListTable);
            $listTable.children('tbody').html(template('listTemplate', data));

            if(data.result.length) {
                $listTools.show();
            }
            if(this.page.totalCount > 10) {
                $listTable.removeClass('list-one-page');
            } else {
                $listTable.addClass('list-one-page');
            }
            setBtnOfAdd(data.result.length);
		},
		error: function () {
			$(idStrListTable +'>tbody').html(template('listTemplate', { result: [] }));
		}
	});


	//控制添加按钮
    function setBtnOfAdd(length) {
    	if(shopInfoData.template_id !== 7) return;
        if(length >= 1) {
            $('#btnShowAddBox').hide();
        } else {
            $('#btnShowAddBox').show();
        }
    }


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
			title_like: val
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
		var mode = $(this).data('mode');
		if(mode === 'edit') {
			showEdit(id);
		} else if(mode === 'qr') {
			showEditQr(id);
		} else if(mode === 'view') {
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
	$listTools.children('.list-tools-left').on('click', '#btnListRemove', function () {
		getIdList('确定要禁用吗？', function (idList, $trs) {
			ajax.deleteAjaxData({
				url: 'merchant/shops/'+ shopInfoData.shop_id +'/contents/themes?items='+ idList.join(','),
				success: function () {
					pageLoader.resetThenRequest();
					$trs.removeClass('active');
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
	var $editFormContainer = $('#editFormContainer');
	var $currentTarget = null;
	var themeId;
	var editMode; //'new':新增, 'edit':修改


	//初始化是否禁用开关
	$editFormContainer.find('input[name=is_deleted]').bootstrapSwitch();

	shopBase.initFileUpload({
		fileInputId: idStrFileUploadImage,
		maxFileSize: 1024 * 1024,
		success: function (result) {
			if($currentTarget) {
				$currentTarget.find('.image-contain').css('background-image', 'url('+ result.file_url +')');
				$currentTarget.find('input[name=cover_src]').val(result.file_name);
			}
		}
	});



	/*
	* 新增模式
	* */
	$('#btnShowAddBox').on('click', function () {
		editMode = 'new';
		$('#editTile').children('[data-mode=new]').show().siblings().hide();
		$('#isDeleteDWrapper').hide();
		$editFormContainer.show().siblings('.page-list-container').hide();
	});

	/*
	 * 修改模式
	 * */
	function showEdit(id) {
		$('#editTile').children('[data-mode=edit]').show().siblings().hide();

		getThemeById(id, function (data) {
			editMode = 'edit';
			themeId = id;

			$('#isDeleteDWrapper').show();
            $editFormContainer.find('input[name=is_deleted]').bootstrapSwitch('state', data.is_deleted);
			shopBase.setDataBinds(data, $editFormContainer);

			$editFormContainer.show().siblings('.page-list-container').hide();
		});
	}


	//上传封面
	$editFormContainer.find('.btn-file').on('click', function () {
		$currentTarget = $(this).getParentByClassName('form-item-content');
		$(idStrFileUploadImage).trigger('click');
	});

    /*
    * 提交保存
    * */
	$('#btnEditFormSubmit').on('click', function () {
		if(editMode === 'edit' && !themeId) return;

		var data = shopBase.getAndVerificationData($editFormContainer, true);
		if(!data) return;
		// console.log('新增:', data);

        var $btn = $(this).attr('disabled', 'disabled');
		if(editMode === 'new') { //新增
			ajax.postAjaxData({
				url: app.getFullInfo(urls.postTheme, {shop_id: shopInfoData.shop_id}),
				data: data,
				success: function () {
					$editFormContainer.hide().siblings('.page-list-container').show();
					pageLoader.resetThenRequest();
					resetFormContent();
					allProductsData = null;
				},
                complete: complete
			})
		} else {
			ajax.putAjaxData({
				url: app.getFullInfo(urls.putTheme, { shop_id: shopInfoData.shop_id, content_theme_id: themeId }),
				data: data,
				success: function () {
					$editFormContainer.hide().siblings('.page-list-container').show();
					pageLoader.resetThenRequest();
					resetFormContent();
					allProductsData = null;
				},
                complete: complete
			})
		}

        function complete() {
            $btn.removeAttr('disabled');
        }
	});

	//取消编辑
	$('#btnEditFormCancel').on('click', function () {
		resetFormContent();
	});

	//重置表单
	function resetFormContent() {
		editMode = '';
		themeId = null;
		$currentTarget = null;

		$editFormContainer.hide().siblings('.page-list-container').show();
        $editFormContainer.find('input, textarea').val('');
		$editFormContainer.find('.image-contain').css('background-image', 'url('+ defaultImageUrl +')');
	}




	/*
	 * 查看
	 * */
	var $viewFormContainer = $('#viewFormContainer');
	function showView(id) {
		getThemeById(id, function (data) {
			data.is_deleted_text = data.is_deleted ? '已禁用' : '否';
			shopBase.setDataBinds(data, $viewFormContainer);
			$viewFormContainer.show().siblings('.page-list-container').hide();
		});
	}

	$('#btnViewFormClose').on('click', function () {
		$viewFormContainer.hide().siblings('.page-list-container').show();
		shopBase.setDataUnbind($viewFormContainer);
	});




	/*
	 * 关联商品模块
	 * */
    var $editPrFormContainer = $('#editPrFormContainer');
    var $selectAllProducts = $editPrFormContainer.find('select[name=theme_name]'),
        $selectProductsOfTheme = $editPrFormContainer.find('select[name=theme_name_pr]');

    var $prThemesTools = $editPrFormContainer.find('.pr-themes-tools');
    var $btnAddSome = $prThemesTools.find('button[data-mode=addSome]'),
        $btnRemoveSome = $prThemesTools.find('button[data-mode=removeSome]');


	/*
	 * 显示关联界面
	 * */
    function showEditQr(id) {
        getThemeById(id, function (data) {
            themeId = id;
            shopBase.setDataBinds(data, $editPrFormContainer);

            $editPrFormContainer.show().siblings('.page-list-container').hide();
        });

        getAllProducts(function (listData) {
            //设置商品列表
            $selectAllProducts.html( setOption(listData) );
            //设置已关联的商品列表
            getProductsByThemeId(id, function (data) {
                var listData = [];
                data.result.forEach(function (item) {
                    var productData = shopBase.findItemInObjectArray(allProductsData, 'content_id', item.content_id);
                    if(productData) {
                        listData.push( $.extend(true, {}, productData) );
                        $selectAllProducts.find('[data-id='+ item.content_id +']').attr('disabled', 'disabled');
                    }
                });
                $selectProductsOfTheme.html( setOption(listData) );
            });
        });
    }


	/*
	 * 查询商品
	 * */
    var ___initSearchProduct = false;
    function initSearchDataForTheme() {
        if(___initSearchProduct) return;

        var $searchBarOfAllProducts = $('#searchBarOfAllProducts'),
            $btnSearch = $('#btnSearchOfAllProducts');

        $btnSearch.on('click', searchDataByName);
        $searchBarOfAllProducts.on('keyup', function (e) {
            app.checkEnterKey(function(){
                searchDataByName();
            }, e);
        });
        $searchBarOfAllProducts.on('click', 'i.fa-remove', function () {
            $searchBarOfAllProducts.removeClass('searching').find('input[name=keyword]').val('');
            //置空请求的数据
            $selectAllProducts.html( setOption(allProductsData) );
            $selectProductsOfTheme.children().each(function () {
                $selectAllProducts.find('option[data-id='+ $(this).data('id') +']').attr('disabled', 'disabled'); //预先处理好数据，效率更高
            });
        });

        //准备搜索
        function searchDataByName() {
            if($btnSearch.hasClass('disabled')) return;
            var val = $searchBarOfAllProducts.find('input[name=keyword]').val().trim();
            if(!val) return;

            $btnAddSome.attr('disabled', 'disabled');
            $btnSearch.addClass('disabled');
            $searchBarOfAllProducts.addClass('searching');

            var data = shopBase.findItemInObjectArrayByParams(allProductsData, { title__like: val });
            $selectAllProducts.html( setOption(data) );
            $selectProductsOfTheme.children().each(function () {
                $selectAllProducts.find('option[data-id='+ $(this).data('id') +']').attr('disabled', 'disabled'); //预先处理好数据，效率更高
            });

            $btnSearch.removeClass('disabled');
        }

        ___initSearchProduct = true;
    }


    //绑定关联按钮
    $editPrFormContainer.find('.pr-themes-tools').on('click', '.btn', function () {
        var mode = $(this).data('mode');
        switch (mode) {
            case 'addAll':
                addAllProductsToTheme();
                break;
            case 'addSome':
                addProductsToTheme();
                break;
            case 'removeAll':
                removeAllProductsToTheme();
                break;
            case 'removeSome':
                removeProductsToTheme();
                break;
            default:
                break;
        }
    });

    //双击关联
    $selectAllProducts.on('dblclick', 'option', function () {
        addProductsToTheme($(this));
    }).on('change', function () {
        $btnAddSome.removeAttr('disabled');
    });
    //双击取消关联
    $selectProductsOfTheme.on('dblclick', 'option', function () {
        removeProductsToTheme($(this));
    }).on('change', function () {
        $btnRemoveSome.removeAttr('disabled');
    });


    function addAllProductsToTheme() {
        $selectAllProducts.find('option').attr('disabled', 'disabled');

        $selectProductsOfTheme.html( setOption(allProductsData) );
        $btnAddSome.attr('disabled', 'disabled');
    }

    function addProductsToTheme($option) {
        var newOptionData = [];
        ($option || $selectAllProducts.find(':selected')).each(function () {
            var id = $(this).data('id');
            if($selectProductsOfTheme.find('option[data-id='+ id +']').length) return;

            $(this).attr('disabled', 'disabled')[0].selected = false;
            newOptionData.push({
                content_id: $(this).data('id'),
                title: $(this).attr('title')
            });
        });

        $selectProductsOfTheme.append( setOption(newOptionData) );
        $btnAddSome.removeAttr('disabled', 'disabled');
    }

    function removeAllProductsToTheme() {
        $selectProductsOfTheme.find('option').each(function () {
            $(this).remove();
            $selectAllProducts.children().removeAttr('disabled');
        });
        $btnRemoveSome.attr('disabled', 'disabled');
    }

    function removeProductsToTheme($option) {
        ($option || $selectProductsOfTheme.find(':selected')).each(function () {
            $selectAllProducts.find('[data-id='+ $(this).data('id') +']').removeAttr('disabled');
            $(this).remove();
        });
        $btnRemoveSome.attr('disabled', 'disabled');
    }


    function setOption(listData) {
        return shopBase.setOptionsHtml(listData, {
            title: 'title', showTip: true,
            attributes: {
            	content_id: 'id', is_deleted: 'is-deleted'
            }
        }, false);
    }

    //请求所有商品列表
    function getAllProducts(callback) {
        if(!allProductsData) {
            ajax.getAjaxData({
                url: app.getFullInfo(urls.getProductList, {shop_id:shopInfoData.shop_id}),
                data: {
                    pageSize:100000
                },
                success: function(data) {
                    allProductsData = data.result;
                    if(app.isFunction(callback)) callback(allProductsData);
                    initSearchDataForTheme();
                }
            });
        } else {
            if(app.isFunction(callback)) callback(allProductsData);
        }
    }

    //查询单个主题数据
    function getThemeById(id, callback) {
        if(!id) return;
        ajax.getAjaxData({
            url: app.getFullInfo(urls.getTheme,{shop_id: shopInfoData.shop_id, content_theme_id:id}),
            success: function (data) {
                data.start_time = app.getLongToStrYMDHM(data.start_time_long);
                data.end_time = app.getLongToStrYMDHM(data.end_time_long);
                var themeStatusText = '';
                if(data.product_theme_status == 0) {
                    themeStatusText = '已禁用';
                } else if(data.product_theme_status == 1) {
                    themeStatusText = '已上线';
                } else {
                    themeStatusText = '待上线';
                }
                data.product_theme_status_text = themeStatusText;

                if(callback instanceof Function) callback(data);
            }
        });
    }

    //查询单个主题已关联的商品
    function getProductsByThemeId(id, callback) {
        if(!id) return;
        ajax.getAjaxData({
            url: app.getFullInfo(urls.getThemePr,{shop_id: shopInfoData.shop_id, content_theme_id:id}),
            data: {
                pageSize: 10000
            },
            success: callback
        });
    }

	/*
	 * 提交保存关联
	 * */
    $('#btnPrEditFormSubmit').on('click', function () {
        if(!themeId) return;
        var data = {
            theme_id: themeId,
            content_ids: []
        };

        $selectProductsOfTheme.children().each(function () {
            data.content_ids.push($(this).data('id'));
        });

        //异步更新
        ajax.putAjaxData({
            url: app.getFullInfo(urls.putProductPr,{ shop_id: shopInfoData.shop_id, content_theme_id: themeId }),
            data: data,
            success: hidePrFormContainer
        });
    });

    $('#btnPrEditFormCancel').on('click', hidePrFormContainer);

    //取消关联商品窗口
    function hidePrFormContainer() {
        themeId = null;
        $editPrFormContainer.hide().siblings('.page-list-container').show();
        $editPrFormContainer.find('select').empty();
        $('#searchBarOfAllProducts').removeClass('searching').find('input[name=keyword]').val('');
    }
});


