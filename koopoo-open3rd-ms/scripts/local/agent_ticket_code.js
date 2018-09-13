/**
 * Created by gen on 2017/6/1.
 */

var idStrListTable = '#categoriesTable';

//分类列表
var pageLoader = new PagesLoader({
	url: 'ms/agents/systicketcodes/list/',
	pageBarIdString: '#pageNavWrapper',
	autoLoad: true,
	success: function (data) {
		if(data.result.length > 0){
			for (var i = 0; i<data.result.length; i++){
				data.result[i].use_time = app.getLongToStrYMDHMS(data.result[i].use_time_long);
				data.result[i].create_time = app.getLongToStrYMDHMS(data.result[i].create_time_long);
				data.result[i].is_used = data.result[i].is_used == true? '是' : '否';
				data.result[i].is_deleted = data.result[i].is_deleted == true? '是' : '否';
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
		ticket_code: val
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
		url: 'ms/agents/systicketcodes/' + id,
		success: function (data) {
			data.use_time = app.getLongToStrYMDHMS(data.use_time_long);
			data.create_time = app.getLongToStrYMDHMS(data.create_time_long);
			data.is_used = data.is_used == true? '是' : '否';
			data.is_deleted = data.is_deleted == true? '是' : '否';

			shopBase.setDataBinds(data, $viewFormContainer.find('.form-view-base'));
			$viewFormContainer.show().siblings('.page-list-container').hide();
		}
	});
}

$('#btnViewFormClose').on('click', function () {
	$viewFormContainer.hide().siblings('.page-list-container').show();
});

/*
 * 新增
 * */
$('#btnShowAddBox').on('click', function () {
	if(parent.self.nav.currentUser.role_id != 2){
		app.show({content:'代理商才可以创建票券码,当前角色为管理员。',type:2});
		return false;
	}

	app.confirm({
		content: '确定要新增票券码么？',
		okCallback: function(){
			//异步新增
			ajax.postAjaxData({
				url: 'ms/agents/systicketcodes/',
				success: function(data) {
					pageLoader.resetThenRequest();
				}
			});
		}
	});
});
