$(function() {
    var $mainForm = $('#mainForm');
	var $btnLogin = $('#btnSubmit');

	if(!$.browser.webkit && $.browser.ie  && parseInt($.browser.version) < 10){
		$mainForm.empty().hide();
		$('#pageInfo').show();
		$('#btnLogin').attr("href","#");
		return;
	}



    //点击获取验证码
	$('#btnPhoneCode').on('click', function () {
		var data = shopBase.getAndVerificationData($mainForm.find('input[name=mobile_no]').parent(), true);
		if(data && data.mobile_no) {
			var button = this;
            shopBase.buttonCountDown(this);
            ajax.postAjaxData({
                url: 'merchant/merchants/reset_pwd/smscode/send',
                data: {
                    mobile_no: data.mobile_no
                },
                success: function (result) {
                    console.log(result)
                },
				error: function () {
                    shopBase.buttonCountDown(button, true);
                }
            })
		}
    });


	//修改密码按钮事件
	$btnLogin.on('click', function(){
		var data = shopBase.getAndVerificationData($mainForm, true);
		if(!data) return;

		var $btn = $(this).addClass('disabled');
		ajax.postAjaxData({
			url: 'merchant/merchants/reset_pwd',
			data: data,
			success: function(){
                app.alert({
					title: '密码找回成功！',
                    content: '<div class="pt-5 pb-15 f14">您的密码已成功找回，请重新登录！</div>',
                    otherButtons: ['去登录'],
                    callback: function(){
                        top.location.href = 'login.html';
                    }
                });
			},
			error: function() {
				$btn.removeClass('disabled');
			}
		});
	});


	$mainForm.on('keyup', 'input', function(e){
		app.checkEnterKey(function(){
			$btnLogin.trigger('click');
		}, e);
	});


});
