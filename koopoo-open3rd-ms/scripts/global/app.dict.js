/**
 * 字段解释词典(依赖app.config.js、app.common.js、app.request.js)
 */
var dict = {};

(function(me){
	var $__me = me;
	
	/**
	 * 填充Map或者List的元素数据
	 */
	me._fillMapOrListForData = function(list, objMap, keyValueList){
		list.map(function(item, index){
			if(objMap){
				objMap[item.key] = item;
			}
			if(keyValueList){
				keyValueList.push(item);
			}
		});
	};
	
	//通用系列
	/**
	 * 通用(是/否)-数据
	 */
	me.getCommonStatusForData_A = function(objMap, keyValueList){
		var _dataList =
			[
				{key: '0',value: '禁用'},
				{key: '1',value: '上线'}
			];
		$__me._fillMapOrListForData(_dataList, objMap, keyValueList);
	};
	/**
	 * 通用(是/否)-html
	 */
	me.getCommonStatusForHtml_A = function(state){
		var class_name, text;
		switch(''+state){
			case '0': class_name='btn-danger';text='禁用';break;
			case '1': class_name='btn-success';text='上线';break;
		}
		return !text ? state : '<a class="btn '+class_name+' btn-xs colorTag">'+text+'</a>';
	};
	/**
	 * 通用(是/否)-数据
	 */
	me.getCommonStatusForData_B = function(objMap, keyValueList){
		var _dataList =
			[
				{key: '0',value: '禁用'},
				{key: '1',value: '上线'},
				{key: '2',value: '待上线'}
			];
		$__me._fillMapOrListForData(_dataList, objMap, keyValueList);
	};
	/**
	 * 通用(是/否)-html
	 */
	me.getCommonStatusForHtml_B = function(state){
		var class_name, text;
		switch(''+state){
			case '0': class_name='btn-danger';text='禁用';break;
			case '1': class_name='btn-success';text='上线';break;
			case '2': class_name='btn-primary';text='待上线';break;
		}
		return !text ? state : '<a class="btn '+class_name+' btn-xs colorTag">'+text+'</a>';
	};
	/**
	 * 通用(是/否)-数据
	 */
	me.getCommonYesOrNoForData_A = function(objMap, keyValueList){
		var _dataList = 
		[
			{key: '0',value: '否'},
			{key: '1',value: '是'}
		];
		$__me._fillMapOrListForData(_dataList, objMap, keyValueList);
	};
	/**
	 * 通用(是/否)-html
	 */
	me.getCommonYesOrNoForHtml_A = function(state){
		var class_name, text;
		switch(''+state){
			case '0': class_name='btn-danger';text='否';break;
			case '1': class_name='btn-success';text='是';break;
		}
		return !text ? state : '<a class="btn '+class_name+' btn-xs colorTag">'+text+'</a>';
	};

	/**
	 * 通用(是/否)-数据
	 */
	me.getCommonYesOrNoForData_B = function(objMap, keyValueList){
		var _dataList =
		[
			 {key: 'false',value: '否'},
             {key: 'true',value: '是'}
        ];
		$__me._fillMapOrListForData(_dataList, objMap, keyValueList);
	};
	/**
	 * 通用(是/否)-html
	 */
	me.getCommonYesOrNoForHtml_B = function(state){
		var class_name, text;
		switch(''+state){
			case 'false': class_name='btn-danger';text='否';break;
			case 'true': class_name='btn-success';text='是';break;
		}
		return !text ? state : '<a class="btn '+class_name+' btn-xs colorTag">'+text+'</a>';
	};
	/**
	 * 通用(是/否),颜色和上面的不一样-html
	 */
	me.getCommonYesOrNoForHtml_BR = function(state){
		var class_name, text;
		switch(''+state){
			case 'false': class_name='btn-success';text='否';break;
			case 'true': class_name='btn-danger';text='是';break;
		}
		return !text ? state : '<a class="btn '+class_name+' btn-xs colorTag">'+text+'</a>';
	};
	/**
	 * sex-数据
	 */
	me.getSexForData = function(objMap, keyValueList){
		var _dataList =
			[
            {key: '0',value: '未知'},
			{key: '1',value: '男'},
			{key: '2',value: '女'}
		];
		$__me._fillMapOrListForData(_dataList, objMap, keyValueList);
	};

	/**
	 * sex-html
	 */
	me.getSexForHtml = function(state){
		var class_name, text;
		switch(''+state){
			case '0': class_name='btn-success';text='未知';break;
			case '1': class_name='btn-success';text='男';break;
			case '2': class_name='btn-success';text='女';break;
		}
		return !text ? state : '<a class="btn '+class_name+' btn-xs colorTag">'+text+'</a>';
	};

	//通用系列 end
	
	//静态数据
	/**
	 * 后台角色-数据
	 */
	me.getAuthRoleForData = function(objMap, keyValueList){
		var _dataList = 
		[
			{key: '1',value: '超级管理员'},
			{key: '2',value: '代理商'}
        ];
		$__me._fillMapOrListForData(_dataList, objMap, keyValueList);
	};
	/**
	 * 后台角色-html
	 */
	me.getAuthRoleForHtml = function(state){
		var class_name, text;
		switch(''+state){
			case '1': class_name='btn-success';text='超级管理员';break;
			case '2': class_name='btn-primary';text='代理商';break;
		}
		return !text ? state : '<a class="btn '+class_name+' btn-xs colorTag">'+text+'</a>';
	};
	/**
	 * 婚否-数据
	 */
	me.getMarriageForData = function(objMap, keyValueList){
		var _dataList =
			[
				{key: '未婚',value: '未婚'},
				{key: '已婚',value: '已婚'},
				{key: '离异',value: '离异'}
			];
		$__me._fillMapOrListForData(_dataList, objMap, keyValueList);
	};
	/**
	 * 婚否-html
	 */
	me.getMarriageForHtml = function(state){
		var class_name, text;
		switch(''+state){
			case '未婚': class_name='btn-success';text='未婚';break;
			case '已婚': class_name='btn-info';text='已婚';break;
			case '离异': class_name='btn-info';text='离异';break;
		}
		return !text ? state : '<a class="btn '+class_name+' btn-xs colorTag">'+text+'</a>';
	};
	/**
	 * 星座-数据
	 */
	me.getConstellationForData = function(objMap, keyValueList){
		var _dataList =
			[
				{key: '白羊座',value: '白羊座：3月21日～4月20日 (Aries)'},
				{key: '金牛座',value: '金牛座：4月21日～5月21日 (Taurus)'},
				{key: '双子座',value: '双子座：5月22日～6月21日 (Gemini)'},
				{key: '巨蟹座',value: '巨蟹座：6月22日～7月22日 (Cancer)'},
				{key: '狮子座',value: '狮子座：7月23日～8月23日 (Leo)'},
				{key: '处女座',value: '处女座：8月24日～9月23日 (Virgo)'},
				{key: '天秤座',value: '天秤座：9月24日～10月23日 (Libra)'},
				{key: '天蝎座',value: '天蝎座：10月24日～11月22日 (Scorpio)'},
				{key: '射手座',value: '射手座：11月23日～12月21日 (Sagittarius)'},
				{key: '摩羯座',value: '摩羯座：12月22日～1月20日 (Capricorn)'},
				{key: '水瓶座',value: '水瓶座：1月21日～2月19日 (Aquarius)'},
				{key: '双鱼座',value: '双鱼座：2月20日～3月20日 (Pisces)'},

			];
		$__me._fillMapOrListForData(_dataList, objMap, keyValueList);
	};
	/**
	 * 星座-html
	 */
	me.getConstellationForHtml = function(state){
		var class_name, text;
		switch(''+state){
			case '白羊座': class_name='btn-info';text='白羊座';break;
			case '金牛座': class_name='btn-info';text='金牛座';break;
			case '双子座': class_name='btn-info';text='双子座';break;
			case '巨蟹座': class_name='btn-info';text='巨蟹座';break;
			case '狮子座': class_name='btn-info';text='狮子座';break;
			case '处女座': class_name='btn-info';text='处女座';break;
			case '天秤座': class_name='btn-info';text='天秤座';break;
			case '天蝎座': class_name='btn-info';text='天蝎座';break;
			case '射手座': class_name='btn-info';text='射手座';break;
		}
		return !text ? state : '<a class="btn '+class_name+' btn-xs colorTag">'+text+'</a>';
	};

	/**
	 * 政治面貌-数据
	 */
	me.getPoliticalForData = function(objMap, keyValueList){
		var _dataList =
			[
				{key: '党员',value: '党员'},
				{key: '预备党员',value: '预备党员'},
				{key: '团员',value: '团员'},
				{key: '群众',value: '群众'}
			];
		$__me._fillMapOrListForData(_dataList, objMap, keyValueList);
	};
	/**
	 * 政治面貌-html
	 */
	me.getPoliticalForHtml = function(state){
		var class_name, text;
		switch(''+state){
			case '党员': class_name='btn-info';text='党员';break;
			case '预备党员': class_name='btn-success';text='预备党员';break;
			case '团员': class_name='btn-success';text='团员';break;
			case '群众': class_name='btn-success';text='群众';break;
		}
		return !text ? state : '<a class="btn '+class_name+' btn-xs colorTag">'+text+'</a>';
	};
	/**
	 * 学历-数据
	 */
	me.getEducationForData = function(objMap, keyValueList){
		var _dataList =
			[
				{key: '博士及以上',value: '博士及以上'},
				{key: '硕士',value: '硕士'},
				{key: '本科',value: '本科'},
				{key: '大专',value: '大专'},
				{key: '高中/中专',value: '高中/中专'},
				{key: '初中及以下',value: '初中及以下'},
			];
		$__me._fillMapOrListForData(_dataList, objMap, keyValueList);
	};
	/**
	 * 学历-html
	 */
	me.getEducationForHtml = function(state){
		var class_name, text;
		switch(''+state){
			case '博士及以上': class_name='btn-success';text='博士及以上';break;
			case '硕士': class_name='btn-danger';text='硕士';break;
			case '本科': class_name='btn-primary';text='本科';break;
			case '大专': class_name='btn-primary';text='大专';break;
			case '高中/中专': class_name='btn-primary';text='高中/中专';break;
			case '初中及以下': class_name='btn-primary';text='初中及以下';break;
		}
		return !text ? state : '<a class="btn '+class_name+' btn-xs colorTag">'+text+'</a>';
	};
	/**
	 * 民族-数据
	 */
	me.getUserNationForData = function(objMap, keyValueList){
		var _dataList =
			[
				{key: '汉族',value: '汉族'},
				{key: '壮族',value: '壮族'},
				{key: '满族',value: '满族'},
				{key: '回族',value: '回族'},
				{key: '苗族',value: '苗族'},
				{key: '维吾尔族',value: '维吾尔族'},
				{key: '土家族',value: '土家族'},
				{key: '彝族',value: '彝族'},
				{key: '蒙古族',value: '蒙古族'},
				{key: '藏族',value: '藏族'},
				{key: '布依族',value: '布依族'},
				{key: '侗族',value: '侗族'},
				{key: '瑶族',value: '瑶族'},
				{key: '朝鲜族',value: '朝鲜族'},
				{key: '白族',value: '白族'},
				{key: '哈尼族',value: '哈尼族'},
				{key: '哈萨克族',value: '哈萨克族'},
				{key: '黎族',value: '黎族'},
				{key: '傣族',value: '傣族'},
				{key: '畲族',value: '畲族'},
				{key: '傈僳族',value: '傈僳族'},
				{key: '仡佬族',value: '仡佬族'},
				{key: '东乡族',value: '东乡族'},
				{key: '高山族',value: '高山族'},
				{key: '拉祜族',value: '拉祜族'},
				{key: '水族',value: '水族'},
				{key: '佤族',value: '佤族'},
				{key: '纳西族',value: '纳西族'},
				{key: '羌族',value: '羌族'},
				{key: '土族',value: '土族'},
				{key: '仫佬族',value: '仫佬族'},
				{key: '锡伯族',value: '锡伯族'},
				{key: '柯尔克孜族',value: '柯尔克孜族'},
				{key: '达斡尔族',value: '达斡尔族'},
				{key: '景颇族',value: '景颇族'},
				{key: '毛南族',value: '毛南族'},
				{key: '撒拉族',value: '撒拉族'},
				{key: '布朗族',value: '布朗族'},
				{key: '塔吉克族',value: '塔吉克族'},
				{key: '阿昌族',value: '阿昌族'},
				{key: '普米族',value: '普米族'},
				{key: '鄂温克族',value: '鄂温克族'},
				{key: '怒族',value: '怒族'},
				{key: '京族',value: '京族'},
				{key: '基诺族',value: '基诺族'},
				{key: '德昂族',value: '德昂族'},
				{key: '保安族',value: '保安族'},
				{key: '俄罗斯族',value: '俄罗斯族'},
				{key: '裕固族',value: '裕固族'},
				{key: '乌孜别克族',value: '乌孜别克族'},
				{key: '门巴族',value: '门巴族'},
				{key: '鄂伦春族',value: '鄂伦春族'},
				{key: '独龙族',value: '独龙族'},
				{key: '塔塔尔族',value: '塔塔尔族'},
				{key: '赫哲族',value: '赫哲族'},
				{key: '珞巴族',value: '珞巴族'}

			];
		$__me._fillMapOrListForData(_dataList, objMap, keyValueList);
	};
	/**
	 * 民族-html
	 */
	me.getUserNationForHtml = function(state){
		var class_name, text;
		switch(''+state){
			case '汉族': class_name='btn-primary';text='汉族 ';break;
			// case '3': class_name='btn-danger';text='未通过';break;
			default: class_name='btn-success';text=''+state;break;
		}
		return !text ? state : '<a class="btn '+class_name+' btn-xs colorTag">'+text+'</a>';
	};
	/**
	 * 前台用户注册来源-数据
	 */
	me.getRegisterSourceForData = function(objMap, keyValueList){
		var _dataList =
			[
				{key: '1',value: '手机注册'},
				{key: '2',value: '微信注册'},
				{key: '3',value: '后台注册'}
			];
		$__me._fillMapOrListForData(_dataList, objMap, keyValueList);
	};
	/**
	 * 前台用户注册来源-html
	 */
	me.getRegisterSourceForHtml = function(state){
		var class_name, text;
		switch(''+state){
			case '1': class_name='btn-success';text='手机注册';break;
			case '2': class_name='btn-success';text='微信注册';break;
			case '3': class_name='btn-info';text='后台注册';break;
		}
		return !text ? state : '<a class="btn '+class_name+' btn-xs colorTag">'+text+'</a>';
	};

	/**
	 * 发布状态-数据
	 */
	me.getIssueStatusForData = function(objMap, keyValueList){
		var _dataList =
			[
				{key: '1',value: '未发布'},
				{key: '2',value: '发布中'},
				{key: '3',value: '已结束'}
			];
		$__me._fillMapOrListForData(_dataList, objMap, keyValueList);
	};
	/**
	 * 发布状态-html
	 */
	me.getIssueStatusForHtml = function(state){
		var class_name, text;
		switch(''+state){
			case '1': class_name='btn-info';text='未发布';break;
			case '2': class_name='btn-success';text='发布中';break;
			case '3': class_name='btn-danger';text='已结束';break;
		}
		return !text ? state : '<a class="btn '+class_name+' btn-xs colorTag">'+text+'</a>';
	};

	/**
	 * 审核状态-数据
	 */
	me.getAuditStatusForData = function(objMap, keyValueList){
		var _dataList =
			[
				{key: '1',value: '未审核'},
				{key: '2',value: '审核中'},
				{key: '3',value: '已通过'},
				{key: '4',value: '未通过'}
			];
		$__me._fillMapOrListForData(_dataList, objMap, keyValueList);
	};
	/**
	 * 审核状态-html
	 */
	me.getAuditStatusForHtml = function(state){
		var class_name, text;
		switch(''+state){
			case '1': class_name='btn-info';text='未审核';break;
			case '2': class_name='btn-info';text='审核中';break;
			case '3': class_name='btn-success';text='已通过';break;
			case '4': class_name='btn-danger';text='未通过';break;
		}
		return !text ? state : '<a class="btn '+class_name+' btn-xs colorTag">'+text+'</a>';
	};

	/**
	 * 订单状态-数据
	 */
	me.getOrderPayStatusForData = function(objMap, keyValueList){
		var _dataList =
			[
				{key: '1',value: '待支付'},
				{key: '2',value: '已支付'},
				{key: '3',value: '待退款'},
				{key: '4',value: '已退款'},

			];
		$__me._fillMapOrListForData(_dataList, objMap, keyValueList);
	};
	/**
	 * 订单状态-html
	 */
	me.getOrderPayStatusForHtml = function(state){
		var class_name, text;
		switch(''+state){
			case '1': class_name='btn-danger';text='待支付';break;
			case '2': class_name='btn-success';text='已支付';break;
			case '3': class_name='btn-info';text='待退款';break;
			case '4': class_name='btn-primary';text='已退款';break;
		}
		return !text ? state : '<a class="btn '+class_name+' btn-xs colorTag">'+text+'</a>';
	};

	/**
	 * 发货状态-html
	 */
	me.getShippingStatusForHtml = function(state){
		var class_name, text;
		switch(''+state){
			case '0': class_name='btn-danger';text='未发货';break;
			case '1': class_name='btn-info';text='部分发货';break;
			case '2': class_name='btn-success';text='已发货';break;
			case '3': class_name='btn-primary';text='部分退货';break;
			case '4': class_name='btn-primary';text='已退货';break;
		}
		return !text ? state : '<a class="btn '+class_name+' btn-xs colorTag">'+text+'</a>';
	};

	/**
	 * 发货状态-数据
	 */
	me.getShippingStatusForData = function(objMap, keyValueList){
		var _dataList =
			[
				{key: '0',value: '未发货'},
				{key: '1',value: '部分发货'},
				{key: '2',value: '已发货'},
				{key: '3',value: '部分退货'},
				{key: '4',value: '已退货'},

			];
		$__me._fillMapOrListForData(_dataList, objMap, keyValueList);
	};


	/**
	 * 优惠类型-数据
	 */
	me.getCouponThenTypeForData = function(objMap, keyValueList){
		var _dataList =
			[
				{key: '1',value: '打折比率'},
				{key: '2',value: '打折金额'}

			];
		$__me._fillMapOrListForData(_dataList, objMap, keyValueList);
	};
	/**
	 * 优惠类型-html
	 */
	me.getCouponThenTypeForHtml = function(state){
		var class_name, text;
		switch(''+state){
			case '1': class_name='btn-info';text='打折比率';break;
			case '2': class_name='btn-success';text='打折金额';break;
		}
		return !text ? state : '<a class="btn '+class_name+' btn-xs colorTag">'+text+'</a>';
	};

	/**
	 * 授权方公众号类型-数据
	 */
	me.getServiceTypeForData = function(objMap, keyValueList){
		var _dataList =
			[
				{key: '0',value: '订阅号'},
				{key: '1',value: '订阅号(老)'},
				{key: '2',value: '服务号'},
				{key: '5',value: '小程序'}

			];
		$__me._fillMapOrListForData(_dataList, objMap, keyValueList);
	};
	/**
	 * 授权方公众号类型-html
	 */
	me.getServiceTypeForHtml = function(state){
		var class_name, text;
		switch(''+state){
			case '0': class_name='btn-info';text='订阅号';break;
			case '1': class_name='btn-success';text='订阅号(老)';break;
			case '2': class_name='btn-success';text='服务号';break;
			case '5': class_name='btn-success';text='小程序';break;
		}
		return !text ? state : '<a class="btn '+class_name+' btn-xs colorTag">'+text+'</a>';
	};
	//静态数据 end

	//动态数据
	/**
	 * Ajax获取国家信息-数据
	 * @param objMap
	 * @param keyValueList
	 * @param options
	 */
	me.getAjaxCountryData = function(objMap, keyValueList, options){
		var _page= {'pageSize':2147483647,'pageNumber':1,'sortColumns':'country_seq asc,country_id asc'};
		var page = options.data ? $.extend(_page, options.data) : _page;
		var url = 'ms/countrys/list';
		ajax.getAjaxData({
			url:  url,
			data: page,
			success: function(data) {
				var result = data.result;
				if(result.length > 0){
					result.map(function(item, index){
						if(objMap){
							objMap[item.country_code2] = {
                                country_code2: item.country_code2,
                                country_code3: item.country_code3,
                                country_name: item.country_name
							};
						}
						if(keyValueList){
							keyValueList.push({
                                country_code2: item.country_code2,
								country_code3: item.country_code3,
								country_name: item.country_name
                            });
						}
					});
				}else{
					//未查询到数据
				}

				if(options.callback) options.callback();
			}
		});
	};
	/**
	 * Ajax获取省级信息-数据
	 * @param objMap
	 * @param keyValueList
	 * @param options
	 */
	me.getAjaxProvinceData = function(objMap, keyValueList, options){
		var _page= {'pageSize':2147483647,'pageNumber':1,'sortColumns':'province_code desc'};
		var page = options.data ? $.extend(_page, options.data) : _page;
		var url = 'ms/provinces/list';
		ajax.getAjaxData({
			url:  url,
			data: page,
			success: function(data) {
				var result = data.result;
				if(result.length > 0){
					result.map(function(item, index){
						if(objMap){
							objMap[item.province_code] = {
                                province_code: item.province_code,
                                country_code2: item.country_code2,
                                province_name: item.province_name
							};
						}
						if(keyValueList){
							keyValueList.push({
                                province_code: item.province_code,
                                country_code2: item.country_code2,
								province_name: item.province_name
                            });
						}
					});
				}else{
					//未查询到数据
				}

				if(options.callback) options.callback();
			}
		});
	};
	/**
	 * Ajax获取市级信息-数据
	 * @param objMap
	 * @param keyValueList
	 * @param options
	 */
	me.getAjaxCityData = function(objMap, keyValueList, options){
		var _page= {'pageSize':2147483647,'pageNumber':1,'sortColumns':'city_code desc'};
		var page = options.data ? $.extend(_page, options.data) : _page;
		var url = 'ms/citys/list';
		ajax.getAjaxData({
			url:  url,
			data: page,
			success: function(data) {
				var result = data.result;
				if(result.length > 0){
					result.map(function(item, index){
						if(objMap){
							objMap[item.city_code] = {
                                city_code: item.city_code,
                                province_code: item.province_code,
                                city_name: item.city_name
							};
						}
						if(keyValueList){
							keyValueList.push({
                                city_code: item.city_code,
                                province_code: item.province_code,
                                city_name: item.city_name
                            });
						}
					});
				}else{
					//未查询到数据
				}

				if(options.callback) options.callback();
			}
		});
	};

	//动态数据 end
})(dict);

