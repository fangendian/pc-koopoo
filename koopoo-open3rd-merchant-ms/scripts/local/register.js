$(function($) {
	var $registerForm = $('#registerForm');


    if(!$.browser.webkit && $.browser.ie  && parseInt($.browser.version) < 10){
		$registerForm.empty().hide();
		$('#pageInfo').show();
        $('#btnLogin').attr("href","#");
		return;
    }


	//图片验证码点击事件
	$('#image_code').on('click', function(){
		$(this).attr("src",config.getApiPath('merchant/merchants/register/randomcode?randID=')+Math.random());
	}).click();



	var mobile_no;

	//获取短信验证码
	$('#btnGetCode').on('click', function(){
		if($(this).hasClass('disabled')) return;

		var data = shopBase.getAndVerificationData($registerForm.children('.form-base-wrapper'), true);
		if(!data) {
			console.warn('填写有误');
			return;
		}

		var $btn = $(this).addClass('disabled');
		shopBase.buttonCountDown(this);
		ajax.postAjaxData({
			url: 'merchant/merchants/register/smscode/send',
			data: data,
			success: function(){
				$('#stepDoneWrapper').show().siblings('.form-first-wrapper').hide();
				mobile_no = data.mobile_no;
			},
			error: function(jqXHR, textStatus, errorThrown) {
				shopBase.buttonCountDown($btn[0]);
			}
		});
	});

	$registerForm.on('keyup', 'input', function(e){
		app.checkEnterKey(function(){
			$('#btnRegister').trigger('click');
		}, e);
	});
	
	
	$('#btnRegister').on('click', function() {
		var data = shopBase.getAndVerificationData($registerForm, true);
		if(!data) return;

		if(!$('#checkboxAgree')[0].checked) {
			shopBase.showTip('请阅读并同意《靠谱注册协议》', true);
			return;
		}

		data.mobile_no = mobile_no;
		var $btn = $(this).addClass('disabled');
		ajax.postAjaxData({
			url: 'merchant/merchants/register',
			data: data,
			success: function (data) {
				location.href = 'user/main.html';
			},
			error: function () {
				$btn.removeClass('disabled');
			}
		})
	});
	


});
