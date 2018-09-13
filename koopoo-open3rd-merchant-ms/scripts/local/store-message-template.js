shopBase.getShopInfo(function (shopInfoData) {
	var defaultImageUrl = config.getDefImgUrl();
	var idStrListTable = '#listTable';
	var $listTools = $('#listTools');


	//获取消息模板相关的数据
	function get_temp() {
		ajax.getAjaxData({
			url: 'merchant/shops/' + shopInfoData.shop_id + '/templatemsg/list',
			data: {},
			success: function (res) {
				if (res.data != null) {
					for (var i = 0; i < res.data.length; i++) {
						var j = i + 1;
						$("#templateId_" + j).val(res.data[i].templateId)
						$("#templateId_" + j).next().val(res.data[i].customText)
					}
				}
			}
		})
	}
	$(function () {
		get_temp();
	})
	/*
	 * 提交数据
	 * */
	$('#btnFormSubmit').on('click', function () {
		// 获取数据信息
		var templateMessageList = [];
		for(var i=1;i<9;i++){
			// j = i-1
			templateMessageList.push({
				templateId:$("#templateId_" + i).val(),
				type:i,
				customText:$("#remark_" + i).val()
			})
		}

		ajax.putAjaxData({
			url: 'merchant/shops/' + shopInfoData.shop_id + '/templatemsg',
			data: {templateMessageList:templateMessageList},
			success: function (res) {
				if(res.success){
					get_temp();
					app.show({
						content: '提交成功', type: 1
					});
				}else{
					app.show({
						content: res.errorMsg, type: 3
					});
				}
			}
		})
	});

	/*
	 * 验证并且收集基本信息
	 * */
	function verificationData(callback) {
		//基础信息
		var data = shopBase.getAndVerificationData('#baseInfoWrapper', true);
		if (!data) return;
		__verificationData = data;
		if (callback instanceof Function) {
			callback();
		} else {
			return __verificationData;
		}
	}

	$("#see_notic").click(function () {
		showView();
	})
	// 查看
	var $viewFormContainer = $('#viewFormContainer');

	function showView() {
		$viewFormContainer.show().siblings('.page-list-container').hide();
		return;
		ajax.getAjaxData({
			url: 'merchant/shops/' + shopInfoData.shop_id + '/products/',
			success: function (data) {
				// console.log('view data:', data);

				shopBase.setDataBinds(data.product, $viewFormContainer);

				data.videotexList.sort(function (a, b) {
					return a.videotex_seq - b.videotex_seq;
				});
				$viewFormContainer.find('#viewContentTable>tbody').html(template('viewViewContentTemplate', {
					result: data.videotexList,
					defaultImageUrl: defaultImageUrl
				}));

				$viewFormContainer.show().siblings('.page-list-container').hide();

				//拼团信息

			}
		});
	}
	$viewFormContainer.find('.btn-close').on('click', function () {
		$viewFormContainer.hide().siblings('.page-list-container').show();
	});

});