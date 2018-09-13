$(function($) {
	if($.browser.ie  && parseInt($.browser.version) < 10){
		alert('浏览器版本太低! 为了更好的网页操作体验,请使用最新版的IE浏览器,或谷歌,火狐,Safari');
		$('#login-in').attr("disabled","disabled");
		$('#jump-register').attr("href","#");
	}

	var target = $('#login-form');

	//图片验证码点击事件
	$('#image_code').on('click', function(){
		$(this).attr("src",config.getApiPath('ms/sysusers/login/randomcode?randID=') + Math.random());
	});
	$("#image_code").click();

	//登录按钮事件
	$('#login-in').on('click', function(){
		var submitObj = app.getFormData(target);//获取子元素的属性[form-flag="1"]的value属性值
		//验证数据
		if(!app.isUsername(submitObj.user_name)){
			app.show({content:'请输入有效的长度5-16位的用户名,只能包含英文字母,数字,特殊字符"_,@,."',type:2});
			return false;
		}else if(!submitObj.user_pwd){
			app.show({content:'请输入密码',type:2});
			return false;
		}else if(!submitObj.random_code){
			app.show({content:'请输入验证码',type:2});
			return false;
		}
		ajax.postAjaxData({
			url: 'ms/sysusers/login',
			data: submitObj,
			fail_up: false,
			success: function() {
				top.location.href = config.getFullPath('page/main.html');
			},
			error: function(jqXHR, textStatus, errorThrown) {
				try {
					var error = $.parseJSON(jqXHR.responseText);
					if(error.error == '2000'){
						target.find("input[name='user_name']").focus();
						app.show({content:'用户名或密码错误',type:2});
					}else if(error.error == '2001'){
						app.show({content:'用户名或密码错误',type:2});
					}else{
						app.show({content:error.error_description,type:2});
					}
				} catch (e) {//非自定义错误信息
					app.show('非常抱歉，数据加载失败！');
				}
			}
		});
	});

	//用户名事件
	target.find('input[name="user_name"]').on('keydown',function(e) {
		var $self = $(this);
		app.checkEnterKey(function(){
			if(app.isEmpty($self.val())){
				app.show({content:'请输入用户名',type:2});
		   		$self.focus();
		     	return false;
		   	}
			target.find('input[name="user_pwd"]').focus();
		}, e);
	});

	//密码事件
	target.find('input[name="user_pwd"]').on('keydown',function(e) {
		var $self = $(this);
		app.checkEnterKey(function(){
			if(app.isEmpty($self.val())){
				app.show({content:'请输入密码',type:2});
				$self.focus();
				return false;
			}
			target.find('input[name="random_code"]').focus();
			// if(count == 0){
			// 	count++;
			// 	$("#image_code").click();
			// }
		}, e);
	});

	//验证码事件
	target.find('input[name="random_code"]').on('keydown',function(e) {
		var $self = $(this);
		app.checkEnterKey(function(){
			if(app.isEmpty($self.val())){
				app.show({content:'请输入验证码',type:2});
				$self.focus();
				return false;
			}
			$('#login-in').click();
		}, e);
	});

    // //FIXME 上线一定要注释掉
    // setTimeout(function () {
    //     ajax.getAjaxData({
    //         url: 'ms/sysusers/login/randomcode/value?randID=' + Math.random(),
    //         fail_up: false,
    //         success: function(data) {
    //             target.find('input[name="random_code"]').val(data.code);
    //             target.find('input[name="user_name"]').val("zhangsan");
    //             target.find('input[name="user_pwd"]').val("1234567");
    //             // target.find('input[name="user_name"]').val("admin");
    //             // target.find('input[name="user_pwd"]').val("admin@mecare888");
    //             // $('#login-in').click();
    //         },
    //         error: function(jqXHR, textStatus, errorThrown) {
    //
    //         }
    //     });
    // }, 1000);

});
