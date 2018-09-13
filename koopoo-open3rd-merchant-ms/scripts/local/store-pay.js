/**
 * Created by gen on 2017/6/1.
 */

shopBase.getShopInfo(function (shopInfoData) {
	var idStrListTable = '#categoriesTable';
	var $listTools = $('#listTools');

	//分类列表
	var pageLoader = new PagesLoader({
		url: 'merchant/shops/'+ shopInfoData.shop_id +'/pays/list',
		pageBarIdString: '#pageNavWrapper',
		autoLoad: true,
		success: function (data) {
			if(data.result.length > 0){
				for (var i = 0; i<data.result.length; i++){
					data.result[i].modify_time = app.getLongToStrYMDHMS(data.result[i].modify_time_long);
				}
			}
			$(idStrListTable +'>tbody').html(template('listTemplate', data));
            if(this.page.totalCount > 10) {
                $listTools.show();
                $(idStrListTable).removeClass('list-one-page');
            } else {
                $(idStrListTable).addClass('list-one-page');
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
			order_flow_id: val
		});
		$searchBar.addClass('searching');
	}

	/*
	 * 表格的一些操作
	 * */
	$(idStrListTable +'>tbody').on('change', ':checkbox', function () { //单选
		var checked = $(this)[0].checked;
		var $tr = $(this).getParentByTagName('tr');
		if(checked) {
			$tr.addClass('active');
		} else {
			$tr.removeClass('active');
			$tr.parent().siblings('thead').find(':checkbox')[0].checked = false;
		}
	})
		.on('click', '.btn-view', function () {
			var $tr = $(this).getParentByTagName('tr');
			showView($tr.data('id'));
		})
		.siblings('thead').on('change', ':checkbox', function () { //全选
		var checked = !$(this)[0].checked;
		var $tbody = $(this).getParentByTagName('thead').siblings('tbody');
		if(checked) {
			$tbody.children().removeClass('active').each(function () {
				$(this).children(':first').find(':checkbox')[0].checked = false;
			});
		} else {
			$tbody.children().addClass('active').each(function () {
				$(this).children(':first').find(':checkbox')[0].checked = true;
			});
		}
	});

	/*
	 * 查看
	 * */
	var $viewFormContainer = $('#viewFormContainer');
	function showView(id) {
		if(!id) return;
		ajax.getAjaxData({
			url: 'merchant/shops/' + shopInfoData.shop_id + '/pays/' + id,
			success: function (data) {
				data.modify_time = app.getLongToStrYMDHMS(data.modify_time_long);
				data.succeed = data.succeed ? '成功':"否";
				shopBase.setDataBinds(data, $viewFormContainer.find('.form-view-base'));
				$viewFormContainer.show().siblings('.page-list-container').hide();
			}
		});
	}

	$('#btnViewFormClose').on('click', function () {
		$viewFormContainer.hide().siblings('.page-list-container').show();
	});

});