/**
 * Created by gen on 2017/6/1.
 */

var idStrListTable = '#categoriesTable';

//分类列表
var pageLoader = new PagesLoader({
	url: 'ms/agents/shops/list/',
	pageBarIdString: '#pageNavWrapper',
	autoLoad: true,
	success: function (data) {
		if(data.result.length > 0){
			for (var i = 0; i<data.result.length; i++){
				data.result[i].expired_time = app.getLongToStrYMDHMS(data.result[i].expired_time_long);
				data.result[i].old_expired_time = app.getLongToStrYMDHMS(data.result[i].old_expired_time_long);
				data.result[i].new_expired_time = app.getLongToStrYMDHMS(data.result[i].new_expired_time_long);
				data.result[i].create_time = app.getLongToStrYMDHMS(data.result[i].create_time_long);
				data.result[i].is_online = data.result[i].is_online == true? '是' : '否';
			}
		}
		$(idStrListTable +'>tbody').html(template('listTemplate', data));
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
		shop_name_like: val
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
		url: 'ms/agents/shops/' + id,
		success: function (data) {
			data.expired_time = app.getLongToStrYMDHMS(data.expired_time_long);
			data.old_expired_time = app.getLongToStrYMDHMS(data.old_expired_time_long);
			data.new_expired_time = app.getLongToStrYMDHMS(data.new_expired_time_long);
			data.create_time = app.getLongToStrYMDHMS(data.create_time_long);
			data.is_online = data.is_online == true? '是' : '否';

			shopBase.setDataBinds(data, $viewFormContainer.find('.form-view-base'));
			$viewFormContainer.show().siblings('.page-list-container').hide();
		}
	});
}

$('#btnViewFormClose').on('click', function () {
	$viewFormContainer.hide().siblings('.page-list-container').show();
});
