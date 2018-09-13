$(function($) {
	var target = $('#loginForm');
	var $btnLogin = $('#btnSubmit');

	if(!$.browser.webkit && $.browser.ie  && parseInt($.browser.version) < 10){
		target.empty().hide();
		$('#pageInfo').show();
		$('#btnRegister').attr("href","#");
		return;
	}

	//图片验证码点击事件
	$('#image_code').on('click', function(){
		$(this).attr("src",config.getApiPath('merchant/merchants/login/randomcode?randID=')+Math.random());
	}).click();

	//登录按钮事件
	$btnLogin.on('click', function(){
	    var $btn = $(this);
        if(window.__test) {
            autoSetCode(verification, $btn);
		} else {
            verification();
		}

        function verification() {
            var data = shopBase.getAndVerificationData(target, true);
            if(!data) return;
            $btn.addClass('disabled');
            ajax.postAjaxData({
                url: 'merchant/merchants/login',
                data: data,
                success: function(){
                    sessionStorage.removeItem(config.lsk_user_info);
                    sessionStorage.removeItem(config.lsk_shop_info);
                    sessionStorage.removeItem(config.lsk_shop_id);
                    location.href = 'user/main.html';
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    $btn.removeClass('disabled');
                }
            });
        }
	});


	target.on('keyup', 'input', function(e){
		app.checkEnterKey(function(){
			$btnLogin.trigger('click');
		}, e);
	});

    function autoSetCode(callback, $btn) {
        ajax.getAjaxData({
            url: 'merchant/merchants/login/randomcode/value?randID=' + Math.random(),
            fail_up: false,
            success: function(data) {
                target.find('input[name="random_code"]').val(data.code);
                target.find('input[name="mobile_no"]').val("13052197516");
                target.find('input[name="user_pwd"]').val("123456");
                if(typeof callback === 'function') callback();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $btn.removeClass('disabled');
                if(typeof callback === 'function') callback();
            }
        });
    }
});
