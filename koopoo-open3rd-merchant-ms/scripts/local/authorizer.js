$(function($) {
	var queryData = app.getUrlParamsMap();

	ajax.postAjaxData({
		url: app.getFullInfo('merchant/shops/{shop_id}/bind/weixin/callback?auth_code={auth_code}&expires_in={expires_in}', queryData),
		is_loading:true,
		fail_up: false,
		success: function(){
			app.show({content:'后台正在保存数据,请勿关闭窗口,预计5秒后完成并关闭当前浏览器窗口...',type:1,time:5000});
			sessionStorage.removeItem(config.lsk_shop_info);
            setTimeout(function(){
                window.close();
            },5000)

		},
		error: function(jqXHR, textStatus, errorThrown) {
			try {
				var error = $.parseJSON(jqXHR.responseText);
				app.show({content:error.error_description,type:4});
				var info = $("#info");
				info.css({color:"red"});
				info.text(error.error_description);
			} catch (e) {//非自定义错误信息
				app.show('非常抱歉，数据加载失败！');
			}
		}
	});

});
