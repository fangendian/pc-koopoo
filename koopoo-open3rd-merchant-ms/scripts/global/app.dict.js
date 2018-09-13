/**
 * 字段解释词典(依赖app.config.js、app.common.js、app.request.js)
 */
var dict = {};

(function (me) {
	var $__me = me;

	/**
	 * 填充Map或者List的元素数据
	 */
	me._fillMapOrListForData = function (list, objMap, keyValueList) {
		list.map(function (item, index) {
			if (objMap) {
				objMap[item.key] = item;
			}
			if (keyValueList) {
				keyValueList.push(item);
			}
		});
	};
	/**
	 * sex-数据
	 */
	me.getSexForData = function (objMap, keyValueList) {
		var _dataList = [{
				key: '0',
				value: '未知'
			},
			{
				key: '1',
				value: '男'
			},
			{
				key: '2',
				value: '女'
			}
		];
		$__me._fillMapOrListForData(_dataList, objMap, keyValueList);
	};
	//通用系列 end
	/**
	 * sex-数据
	 */
	me.getSexForData = function (objMap, keyValueList) {
		var _dataList = [{
				key: '0',
				value: '未知'
			},
			{
				key: '1',
				value: '男'
			},
			{
				key: '2',
				value: '女'
			}
		];
		$__me._fillMapOrListForData(_dataList, objMap, keyValueList);
	};

	/**
	 * sex-html
	 */
	me.getSexForHtml = function (state) {
		var class_name, text;
		switch ('' + state) {
			case '0':
				class_name = 'btn-success';
				text = '未知';
				break;
			case '1':
				class_name = 'btn-success';
				text = '男';
				break;
			case '2':
				class_name = 'btn-success';
				text = '女';
				break;
		}
		return !text ? state : '<a class="btn ' + class_name + ' btn-xs colorTag">' + text + '</a>';
	};
	/**
	 * sex-html
	 */
	me.getSexForHtml_B = function (state) {
		var class_name, text;
		switch ('' + state) {
			case '0':
				class_name = 'btn-success';
				text = '未知';
				break;
			case '1':
				class_name = 'btn-success';
				text = '男';
				break;
			case '2':
				class_name = 'btn-success';
				text = '女';
				break;
		}
		return !text ? state : text;
	};

	//静态数据
	/**
	 * 星座-数据
	 */
	me.getConstellationForData = function (objMap, keyValueList) {
		var _dataList = [{
				key: '白羊座',
				value: '白羊座：3月21日～4月20日 (Aries)'
			},
			{
				key: '金牛座',
				value: '金牛座：4月21日～5月21日 (Taurus)'
			},
			{
				key: '双子座',
				value: '双子座：5月22日～6月21日 (Gemini)'
			},
			{
				key: '巨蟹座',
				value: '巨蟹座：6月22日～7月22日 (Cancer)'
			},
			{
				key: '狮子座',
				value: '狮子座：7月23日～8月23日 (Leo)'
			},
			{
				key: '处女座',
				value: '处女座：8月24日～9月23日 (Virgo)'
			},
			{
				key: '天秤座',
				value: '天秤座：9月24日～10月23日 (Libra)'
			},
			{
				key: '天蝎座',
				value: '天蝎座：10月24日～11月22日 (Scorpio)'
			},
			{
				key: '射手座',
				value: '射手座：11月23日～12月21日 (Sagittarius)'
			},
			{
				key: '摩羯座',
				value: '摩羯座：12月22日～1月20日 (Capricorn)'
			},
			{
				key: '水瓶座',
				value: '水瓶座：1月21日～2月19日 (Aquarius)'
			},
			{
				key: '双鱼座',
				value: '双鱼座：2月20日～3月20日 (Pisces)'
			},

		];
		$__me._fillMapOrListForData(_dataList, objMap, keyValueList);
	};
	/**
	 * 星座-html
	 */
	me.getConstellationForHtml = function (state) {
		var class_name, text;
		switch ('' + state) {
			case '白羊座':
				class_name = 'btn-info';
				text = '白羊座';
				break;
			case '金牛座':
				class_name = 'btn-info';
				text = '金牛座';
				break;
			case '双子座':
				class_name = 'btn-info';
				text = '双子座';
				break;
			case '巨蟹座':
				class_name = 'btn-info';
				text = '巨蟹座';
				break;
			case '狮子座':
				class_name = 'btn-info';
				text = '狮子座';
				break;
			case '处女座':
				class_name = 'btn-info';
				text = '处女座';
				break;
			case '天秤座':
				class_name = 'btn-info';
				text = '天秤座';
				break;
			case '天蝎座':
				class_name = 'btn-info';
				text = '天蝎座';
				break;
			case '射手座':
				class_name = 'btn-info';
				text = '射手座';
				break;
		}
		return !text ? state : '<a class="btn ' + class_name + ' btn-xs colorTag">' + text + '</a>';
	};



	/**
	 * 民族-数据
	 */
	me.getUserNationForData = function (objMap, keyValueList) {
		var _dataList = [{
				key: '汉族',
				value: '汉族'
			},
			{
				key: '壮族',
				value: '壮族'
			},
			{
				key: '满族',
				value: '满族'
			},
			{
				key: '回族',
				value: '回族'
			},
			{
				key: '苗族',
				value: '苗族'
			},
			{
				key: '维吾尔族',
				value: '维吾尔族'
			},
			{
				key: '土家族',
				value: '土家族'
			},
			{
				key: '彝族',
				value: '彝族'
			},
			{
				key: '蒙古族',
				value: '蒙古族'
			},
			{
				key: '藏族',
				value: '藏族'
			},
			{
				key: '布依族',
				value: '布依族'
			},
			{
				key: '侗族',
				value: '侗族'
			},
			{
				key: '瑶族',
				value: '瑶族'
			},
			{
				key: '朝鲜族',
				value: '朝鲜族'
			},
			{
				key: '白族',
				value: '白族'
			},
			{
				key: '哈尼族',
				value: '哈尼族'
			},
			{
				key: '哈萨克族',
				value: '哈萨克族'
			},
			{
				key: '黎族',
				value: '黎族'
			},
			{
				key: '傣族',
				value: '傣族'
			},
			{
				key: '畲族',
				value: '畲族'
			},
			{
				key: '傈僳族',
				value: '傈僳族'
			},
			{
				key: '仡佬族',
				value: '仡佬族'
			},
			{
				key: '东乡族',
				value: '东乡族'
			},
			{
				key: '高山族',
				value: '高山族'
			},
			{
				key: '拉祜族',
				value: '拉祜族'
			},
			{
				key: '水族',
				value: '水族'
			},
			{
				key: '佤族',
				value: '佤族'
			},
			{
				key: '纳西族',
				value: '纳西族'
			},
			{
				key: '羌族',
				value: '羌族'
			},
			{
				key: '土族',
				value: '土族'
			},
			{
				key: '仫佬族',
				value: '仫佬族'
			},
			{
				key: '锡伯族',
				value: '锡伯族'
			},
			{
				key: '柯尔克孜族',
				value: '柯尔克孜族'
			},
			{
				key: '达斡尔族',
				value: '达斡尔族'
			},
			{
				key: '景颇族',
				value: '景颇族'
			},
			{
				key: '毛南族',
				value: '毛南族'
			},
			{
				key: '撒拉族',
				value: '撒拉族'
			},
			{
				key: '布朗族',
				value: '布朗族'
			},
			{
				key: '塔吉克族',
				value: '塔吉克族'
			},
			{
				key: '阿昌族',
				value: '阿昌族'
			},
			{
				key: '普米族',
				value: '普米族'
			},
			{
				key: '鄂温克族',
				value: '鄂温克族'
			},
			{
				key: '怒族',
				value: '怒族'
			},
			{
				key: '京族',
				value: '京族'
			},
			{
				key: '基诺族',
				value: '基诺族'
			},
			{
				key: '德昂族',
				value: '德昂族'
			},
			{
				key: '保安族',
				value: '保安族'
			},
			{
				key: '俄罗斯族',
				value: '俄罗斯族'
			},
			{
				key: '裕固族',
				value: '裕固族'
			},
			{
				key: '乌孜别克族',
				value: '乌孜别克族'
			},
			{
				key: '门巴族',
				value: '门巴族'
			},
			{
				key: '鄂伦春族',
				value: '鄂伦春族'
			},
			{
				key: '独龙族',
				value: '独龙族'
			},
			{
				key: '塔塔尔族',
				value: '塔塔尔族'
			},
			{
				key: '赫哲族',
				value: '赫哲族'
			},
			{
				key: '珞巴族',
				value: '珞巴族'
			}

		];
		$__me._fillMapOrListForData(_dataList, objMap, keyValueList);
	};


	/**
	 *  拼团状态 - html 
	 */

	me.pintuan_status = function (status) {
		var model = {};
		var colorClass;
		switch (status) { //发货状态
			case 0:
				model.pintuanDesc = '未知';
				colorClass = 'info';
				break;
			case 1: //!!!
				model.pintuanDesc = '拼团失败';
				colorClass = 'danger';
				break;
			case 2:
				model.pintuanDesc = '拼团中';
				colorClass = 'primary';
				break;
			case 3: //!!!
				model.pintuanDesc = '拼团成功';
				colorClass = 'success';
				break;
			default:
				model.pintuanDesc = '未知';
				colorClass = 'info';
				break;
		}
		model.pintuanHtml = '<span class="label label-' + colorClass + ' mc-label">' + model.pintuanDesc + '</span>';
		return model;
	}



	/**
	 * 订单状态-html
	 */
	me.getOrderPayStatusForHtml_B = function (state) {
		var class_name, text;
		switch ('' + state) {
			case '1':
				class_name = 'btn-danger';
				text = '待支付';
				break;
			case '2':
				class_name = 'btn-success';
				text = '已支付';
				break;
			case '3':
				class_name = 'btn-info';
				text = '待退款';
				break;
			case '4':
				class_name = 'btn-primary';
				text = '已退款';
				break;
		}
		return !text ? state : text;
	};

	//返回订单的支付、发货状态
	me.parseOrderStatusToHtml = function (order) {
		var model = {};
		var deliveryStatus = order.shipping_status,
			payStatus = order.pay_status;

		var colorClass;
		if (payStatus !== 1) {
			switch (deliveryStatus) { //发货状态
				case 0:
					model.deliveryDesc = '待发货';
					colorClass = 'info';
					break;
				case 1: //!!!
					model.deliveryDesc = '部分发货';
					colorClass = 'primary';
					break;
				case 2:
					model.deliveryDesc = '已发货';
					colorClass = 'primary';
					break;
				case 3: //!!!
					model.deliveryDesc = '部分退货';
					colorClass = 'warning';
					break;
				case 4:
					model.deliveryDesc = '已退货';
					colorClass = 'danger';
					break;
				case 5:
					model.deliveryDesc = '已确认收货';
					colorClass = 'success';
					break;
				default:
					break;
			}
		} else {
			colorClass = 'default disabled';
			model.deliveryDesc = '未发货';
		}
		model.deliveryHtml = '<span class="label label-' + colorClass + ' mc-label">' + model.deliveryDesc + '</span>';


		var payColorClass;
		switch (payStatus) {
			case 1:
				model.payDesc = "待支付";
				payColorClass = 'warning';
				break;
			case 2:
				model.payDesc = "已支付";
				payColorClass = 'success';
				break;
			case 3:
				model.payDesc = "待退款";
				payColorClass = 'danger';
				break;
			case 4:
				model.payDesc = "已退款";
				payColorClass = 'default';
				break;
			default:
				break;
		}
		model.payHtml = '<span class="label label-' + payColorClass + ' mc-label">' + model.payDesc + '</span>';

		if (payStatus === 2 && deliveryStatus < 3) model.canChange = true;
		return model;
	};


	/**
	 * 优惠类型-数据
	 */
	me.getCouponThenTypeForData = function (objMap, keyValueList) {
		var _dataList = [{
				key: '1',
				value: '打折比率'
			},
			{
				key: '2',
				value: '打折金额'
			}

		];
		$__me._fillMapOrListForData(_dataList, objMap, keyValueList);
	};
	/**
	 * 优惠类型-html
	 */
	me.getCouponThenTypeForHtml = function (state) {
		var class_name, text;
		switch ('' + state) {
			case '1':
				class_name = 'btn-info';
				text = '打折比率';
				break;
			case '2':
				class_name = 'btn-success';
				text = '打折金额';
				break;
		}
		return !text ? state : '<a class="btn ' + class_name + ' btn-xs colorTag">' + text + '</a>';
	};

	/**
	 * 授权方公众号类型-数据
	 */
	me.getServiceTypeForData = function (objMap, keyValueList) {
		var _dataList = [{
				key: '0',
				value: '订阅号'
			},
			{
				key: '1',
				value: '订阅号(老)'
			},
			{
				key: '2',
				value: '服务号'
			},
			{
				key: '5',
				value: '小程序'
			}

		];
		$__me._fillMapOrListForData(_dataList, objMap, keyValueList);
	};
	/**
	 * 授权方公众号类型-html
	 */
	me.getServiceTypeForHtml = function (state) {
		var class_name, text;
		switch ('' + state) {
			case '0':
				class_name = 'btn-info';
				text = '订阅号';
				break;
			case '1':
				class_name = 'btn-success';
				text = '订阅号(老)';
				break;
			case '2':
				class_name = 'btn-success';
				text = '服务号';
				break;
			case '5':
				class_name = 'btn-success';
				text = '小程序';
				break;
		}
		return !text ? state : '<a class="btn ' + class_name + ' btn-xs colorTag">' + text + '</a>';
	};
	//静态数据 end

	//动态数据
	/**
	 * Ajax获取国家信息-数据
	 * @param objMap
	 * @param keyValueList
	 * @param options
	 */
	me.getAjaxCountryData = function (objMap, keyValueList, options) {
		var _page = {
			'pageSize': 2147483647,
			'pageNumber': 1,
			'sortColumns': 'country_seq asc,country_id asc'
		};
		var page = options.data ? $.extend(_page, options.data) : _page;
		var url = 'ms/countrys/list';
		ajax.getAjaxData({
			url: url,
			data: page,
			success: function (data) {
				var result = data.result;
				if (result.length > 0) {
					result.map(function (item, index) {
						if (objMap) {
							objMap[item.country_code2] = {
								country_code2: item.country_code2,
								country_code3: item.country_code3,
								country_name: item.country_name
							};
						}
						if (keyValueList) {
							keyValueList.push({
								country_code2: item.country_code2,
								country_code3: item.country_code3,
								country_name: item.country_name
							});
						}
					});
				} else {
					//未查询到数据
				}

				if (options.callback) options.callback();
			}
		});
	};
	/**
	 * Ajax获取省级信息-数据
	 * @param objMap
	 * @param keyValueList
	 * @param options
	 */
	me.getAjaxProvinceData = function (objMap, keyValueList, options) {
		var _page = {
			'pageSize': 2147483647,
			'pageNumber': 1,
			'sortColumns': 'province_code desc'
		};
		var page = options.data ? $.extend(_page, options.data) : _page;
		var url = 'ms/provinces/list';
		ajax.getAjaxData({
			url: url,
			data: page,
			success: function (data) {
				var result = data.result;
				if (result.length > 0) {
					result.map(function (item, index) {
						if (objMap) {
							objMap[item.province_code] = {
								province_code: item.province_code,
								country_code2: item.country_code2,
								province_name: item.province_name
							};
						}
						if (keyValueList) {
							keyValueList.push({
								province_code: item.province_code,
								country_code2: item.country_code2,
								province_name: item.province_name
							});
						}
					});
				} else {
					//未查询到数据
				}

				if (options.callback) options.callback();
			}
		});
	};
	/**
	 * Ajax获取市级信息-数据
	 * @param objMap
	 * @param keyValueList
	 * @param options
	 */
	me.getAjaxCityData = function (objMap, keyValueList, options) {
		var _page = {
			'pageSize': 2147483647,
			'pageNumber': 1,
			'sortColumns': 'city_code desc'
		};
		var page = options.data ? $.extend(_page, options.data) : _page;
		var url = 'ms/citys/list';
		ajax.getAjaxData({
			url: url,
			data: page,
			success: function (data) {
				var result = data.result;
				if (result.length > 0) {
					result.map(function (item, index) {
						if (objMap) {
							objMap[item.city_code] = {
								city_code: item.city_code,
								province_code: item.province_code,
								city_name: item.city_name
							};
						}
						if (keyValueList) {
							keyValueList.push({
								city_code: item.city_code,
								province_code: item.province_code,
								city_name: item.city_name
							});
						}
					});
				} else {
					//未查询到数据
				}

				if (options.callback) options.callback();
			}
		});
	};

	//动态数据 end
})(dict);