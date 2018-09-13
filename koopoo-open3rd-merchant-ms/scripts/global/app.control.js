/**
 * 与插（组）件相关(依赖app.config.js、app.common.js)
 */
var ctrl = {};

(function(me){
	var $__me = me;
	
	/**
	 * 重置Form
	 * 
	 * @param form_id Form容器ID(对象)或者是form的父容器ID(对象)
	 */
	me.resetForm = function(form_id){
		//清空内容
		var $element = app.getJqueryObject(form_id);
		var $form = null;
		if($element.is('form')){
			$form = $element;
		}else{
			$form = $element.find('form');
		}
		$form.resetForm();
		$form.find('select').trigger('change');
	};
	
	/**
	 * 初始化select2控件
	 * 
	 * @param select2 select2容器
	 * @param options select2属性信息
	 */
	me.initSelect2 = function(select2, options){
		var $select2 = app.getJqueryObject(select2);
		$select2.removeClass();
//		$select2.css('width', '173px');
		var _format = function (item, container) {
			var id = item.id;
			var text = item.text;
			if (!id) { return text; }
			var $arr = text.split(config.select2.split_text);
			if($arr.length > 1){
				if($arr[0] == config.select2.state_one){
					$(container).addClass('state_one');
					var text = [];
					for (var i = 1; i < $arr.length; i++) {
						text.push($arr[i]);
					}
					return text.join('');
				}
			}else{
				$(container).removeClass('state_one');
			}
			return text;
		};
		var _options = {
			placeholder: config.select2.placeholder,
			formatSelection: _format,
			formatResult: _format,
			minimumResultsForSearch: 1,// 小于0不显示搜索框
	      	allowClear: true
		};
		var ops = options ? $.extend(_options, options) : _options;
		if($select2.find('option[value=""]').length < 1){
			$select2.prepend(config.select2.default_option);
		}
		$select2.select2(ops);
		/*$select2.on('select2-clearing',function(e){
			$select2.val('').trigger('change');
		});*/
	};
	
	/**
	 * 根据select2的"op-role"属性初始化select2控件
	 * 
	 * @param select2 select2容器
	 */
	me.initSelect2ForAttribute = function(){
		$__me.initSelect2($('select[op-role="s2-1-1"]'));// 有清除有搜索
		$__me.initSelect2($('select[op-role="s2-1-0"]'), {minimumResultsForSearch: -1}); //有清除无搜索
		$__me.initSelect2($('select[op-role="s2-0-1"]'), {allowClear: false});// 无清除有搜索
		$__me.initSelect2($('select[op-role="s2-0-0"]'), {allowClear: false,minimumResultsForSearch: -1});// 无清除无搜索
	};
	
	/**
	 * select2的option重新加载后,重载控件
	 * 
	 * @param select2 select2容器
	 */
	me.initSelect2ForReloaded = function(select2){
		var $select2 = app.getJqueryObject(select2);
		var op_role = $select2.attr('op-role');
		switch (op_role) {
		case 's2-1-1':
			$__me.initSelect2($select2);// 有清除有搜索
//			$select2.val('');
			break;
		case 's2-1-0':
			$__me.initSelect2($select2, {minimumResultsForSearch: -1}); //有清除无搜索
//			$select2.val('');
			break;
		case 's2-0-1':
			$__me.initSelect2($select2, {allowClear: false});// 无清除有搜索
			break;
		case 's2-0-0':
			$__me.initSelect2($select2, {allowClear: false,minimumResultsForSearch: -1});// 无清除无搜索
			break;
		default:
			break;
		}
	};
	
	/**
	 * select控件增加option
	 * 
	 * @param select select容器
	 * @param options 属性信息
	 */
	me.setSelectOption = function(select, options){
		var _options = {
			data: null,// 数据
			ref_key: 'key',// 键绑定的引用属性
			ref_val: 'value',// 值绑定的引用属性
			is_append: false,// 是否追加
			attributes: []// 属性{key:'', val:'', ref: ''}
		};
		var ops = null;
		if(options instanceof Array){
			_options.data = options;
			ops = _options;
		}else{
			ops = options ? $.extend(true, _options, options) : _options;
		}
		var $select = app.getJqueryObject(select);
		var _html = [];
		if(ops.data instanceof Array){
			ops.data.map(function(item, index){
				_html.push('<option value="'+item[ops.ref_key]+'"');
				if(ops.attributes && ops.attributes.length > 0){
					ops.attributes.map(function(att, i){
						if(att.val){
							_html.push(' '+att.key+'="'+(att.val)+'"');
						}else{
							_html.push(' '+att.key+'="'+(item[att.ref])+'"');
						}
					});
				}
				_html.push('>'+item[ops.ref_val]+'</option>');
		    });
		}else{
			if(Object.getOwnPropertyNames(ops.data).length > 0){
				$.each(ops.data, function (key, value) {
					_html.push('<option value="'+key+'"');
					if(ops.attributes && ops.attributes.length > 0){
						ops.attributes.map(function(att, i){
							if(att.val){
								_html.push(' '+att.key+'="'+(att.val)+'"');
							}
						});
					}
					_html.push('>'+value+'</option>');
				})
			}
		}
		if(!ops.is_append){
			$select.empty();
			$(_html.join('')).appendTo($select);
		}else{
			$(_html.join('')).appendTo($select);
		}
	};

	/**
	 * select2控件增加option
	 * 
	 * @param select2 select2容器
	 * @param options 属性信息
	 */
	me.setSelect2Option = function(select2, options){
		if(select2 instanceof Array){
			select2.map(function(item, index){
				$__me.setSelect2Option(item, options);
			});
			return ;
		}
		var _options = {
			data: null,// 数据
			ref_key: 'key',// 键绑定的引用属性
			ref_val: 'value',// 值绑定的引用属性
			is_append: false,// 是否追加
			reloaded_callback: null,// 重载select2函数
			attributes: [],// 属性{key:'', val:'', ref: ''}
			flag_color: null,// 颜色判别函数   返回标识色  0:无颜色样式
		};
		var ops = null;
		if(options instanceof Array){
			_options.data = options;
			ops = _options;
		}else{
			ops = options ? $.extend(true, _options, options) : _options;
		}
		var $flagColor = function(_html, item, val){
			var state = (ops.flag_color) ? (ops.flag_color(item)) : 0;
			switch (state) {
			case 1:
				_html.push('>'+config.select2.state_one+
					config.select2.split_text+val+'</option>');
				break;
			default:
				_html.push('>'+val+'</option>');
				break;
			}
		};
		var $select2 = app.getJqueryObject(select2);
		var _html = [];
		if(ops.data instanceof Array){
			ops.data.map(function(item, index){
				_html.push('<option value="'+item[ops.ref_key]+'"');
				if(ops.attributes && ops.attributes.length > 0){
					ops.attributes.map(function(att, i){
						if(att.val){
							_html.push(' '+att.key+'="'+(att.val)+'"');
						}else{
							_html.push(' '+att.key+'="'+(item[att.ref])+'"');
						}
					});
				}
				$flagColor(_html, item, item[ops.ref_val]);
		    });
		}else{
			if(Object.getOwnPropertyNames(ops.data).length > 0){
				$.each(ops.data, function (key, value) {
					_html.push('<option value="'+key+'"');
					if(ops.attributes && ops.attributes.length > 0){
						ops.attributes.map(function(att, i){
							if(att.val){
								_html.push(' '+att.key+'="'+(att.val)+'"');
							}
						});
					}
					$flagColor(_html, null, value);
				});
			}
		}
		if(!ops.is_append){
			$select2.html(_html.join(''));
			$__me.initSelect2ForReloaded($select2);
			$select2.val('').trigger('change');
			if(ops.reloaded_callback) ops.reloaded_callback($select2);
		}else{
			$(_html.join('')).appendTo($select2);
		}
	};

	/**
	 * select2控件清空所有选项（保留默认选项）
	 * 
	 * @param select2 select2容器
	 */
	me.clearSelect2Option = function(select2, options){
		var $select2 = app.getJqueryObject(select2);
		var _options = {
			is_default_option: true,// 是否显示默认项
			is_trigger_change: true// 是否触发changge事件
		};
		var ops = options ? $.extend(_options, options) : _options;
		
		$select2.empty();
		if(ops.is_default_option){
			$(config.select2.default_option).appendTo($select2);
		}
		if(ops.is_trigger_change){
			$select2.val(null).trigger('change');
		}
	};
	
	/**
	 * 初始化multiselect控件
	 * 
	 * @param multiselect multiselect容器
	 * @param options multiselect属性信息
	 */
	me.initMultiselect = function(multiselect, options){
		var _getOptionText = function($arr){
			var text = [];
			for (var i = 1; i < $arr.length; i++) {
				text.push($arr[i]);
			}
			return text.join('');
		};
		var $multiselect = app.getJqueryObject(multiselect);
		$multiselect.removeClass();
		var _options = {
			selectAllText: ' 全选',
			filterPlaceholder: '搜索',
			nonSelectedText: '--请选择--',
			nSelectedText: '项',
			allSelectedText: '全选',
			includeSelectAllOption: true,
			enableFiltering: true,
			buttonClass: 'btn btn-sm btn-default',
			numberDisplayed: 1,
			buttonWidth: '100%',
			maxHeight: 200,
			inheritClass: true,
            buttonText: function(options, select) {
                if (this.disabledText.length > 0
                        && (select.prop('disabled') || (options.length == 0 && this.disableIfEmpty)))  {
                    
                    return this.disabledText;
                }
                else if (options.length === 0) {
                    return this.nonSelectedText;
                }
                else if (this.allSelectedText 
                        && options.length === $('option', $(select)).length 
                        && $('option', $(select)).length !== 1 
                        && this.multiple) {

                    if (this.selectAllNumber) {
                        return this.allSelectedText + ' (' + options.length + ')';
                    }
                    else {
                        return this.allSelectedText;
                    }
                }
                else if (options.length > this.numberDisplayed) {
                    return options.length + ' ' + this.nSelectedText;
                }
                else {
                    var selected = '';
                    var delimiter = this.delimiterText;

                    options.each(function() {
                        var label = ($(this).attr('label') !== undefined) ? $(this).attr('label') : $(this).text();
                        var $arr = label.split(config.select2.split_text);
                        if($arr[0] == config.select2.state_one){
                        	label = _getOptionText($arr);
            			}
                        selected += label + delimiter;
                    });
                    
                    return selected.substr(0, selected.length - this.delimiterText.length);
                }
            },
            buttonTitle: function(options, select) {
                if (options.length === 0) {
                    return this.nonSelectedText;
                }
                else {
                    var selected = '';
                    var delimiter = this.delimiterText;

                    options.each(function () {
                        var label = ($(this).attr('label') !== undefined) ? $(this).attr('label') : $(this).text();
                        var $arr = label.split(config.select2.split_text);
                        if($arr[0] == config.select2.state_one){
                        	label = _getOptionText($arr);
            			}
                        selected += label + delimiter;
                    });
                    return selected.substr(0, selected.length - this.delimiterText.length);
                }
            },
			optionLabel: function(element) {
				var id = $(element).val();
	    		var text = $(element).html();
	    		if (!id) { return ''; }
	    		var $arr = text.split(config.select2.split_text);
	    		if($arr.length > 1){
	    			if($arr[0] == config.select2.state_one){
	    				return _getOptionText($arr);
	    			}
	    		}
	    		return text;
	        },
	        optionClass: function(element) {
	        	var id = $(element).val();
	    		var text = $(element).html();
	    		if (!id) { return ''; }
	    		var $arr = text.split(config.select2.split_text);
	    		if($arr.length > 1){
	    			if($arr[0] == config.select2.state_one){
	    				return 'state_one';
	    			}
	    		}
	    		$(element).html();
	    		return '';
	        }
		};
		var ops = options ? $.extend(_options, options) : _options;
		$multiselect.multiselect(ops);
	};
	
	/**
	 * multiselect控件增加option
	 * 
	 * @param multiselect multiselect容器
	 * @param options 属性信息
	 */
	me.setMultiselectOption = function(multiselect, options){
		var _options = {
			data: null,// 数据
			ref_key: 'key',// 键绑定的引用属性
			ref_val: 'value',// 值绑定的引用属性
			is_append: false,// 是否追加
			attributes: [],// 属性{key:'', val:'', ref: ''}
			flag_color: null,// 颜色判别函数   返回标识色  0:无颜色样式
		};
		var ops = null;
		if(options instanceof Array){
			_options.data = options;
			ops = _options;
		}else{
			ops = options ? $.extend(true, _options, options) : _options;
		}
		var $flagColor = function(_html, val){
			var state = (ops.flag_color) ? (ops.flag_color(item)) : 0;
			switch (state) {
			case 1:
				_html.push('>'+config.multiselect.state_one+
					config.multiselect.split_text+val+'</option>');
				break;
			default:
				_html.push('>'+val+'</option>');
				break;
			}
		};
		var $multiselect = app.getJqueryObject(multiselect);
		var _html = [];
		if(ops.data instanceof Array){
			ops.data.map(function(item, index){
				_html.push('<option value="'+item[ops.ref_key]+'"');
				if(ops.attributes && ops.attributes.length > 0){
					ops.attributes.map(function(att, i){
						if(att.val){
							_html.push(' '+att.key+'="'+(att.val)+'"');
						}else{
							_html.push(' '+att.key+'="'+(item[att.ref])+'"');
						}
					});
				}
				$flagColor(_html, item[ops.ref_val]);
		    });
		}else{
			if(Object.getOwnPropertyNames(ops.data).length > 0){
				$.each(ops.data, function (key, value) {
					_html.push('<option value="'+key+'"');
					if(ops.attributes && ops.attributes.length > 0){
						ops.attributes.map(function(att, i){
							if(att.val){
								_html.push(' '+att.key+'="'+(att.val)+'"');
							}
						});
					}
					$flagColor(_html, value);
				})
			}
		}
		if(!ops.is_append){
			$(_html.join('')).appendTo($multiselect);
		}else{
			$multiselect.empty();
			$(_html.join('')).appendTo($multiselect);
		}
	};


	/**
	 * 初始化日期(时间)控件
	 * 
	 * @param start_datetimepicker $datetimepicker容器(起始)
	 * @param start_options datetimepicker配置信息(起始)
	 * @param end_datetimepicker $datetimepicker容器(结束)
	 * @param end_options datetimepicker配置信息(结束)
	 */
	me.initDateTime = function(start_datetimepicker, start_options, end_datetimepicker, end_options){
		var _start_options = $__me._getDatetimePickerDefaultOptions();
		var _end_options = $__me._getDatetimePickerDefaultOptions();
		
		var $start_datetimepicker = app.getJqueryObject(start_datetimepicker);
		var start_ops = $.extend(_start_options, start_options);
		if(!end_datetimepicker){
			return $start_datetimepicker.datetimepicker(start_ops);
		}
		
		var $end_datetimepicker = app.getJqueryObject(end_datetimepicker);
		var end_ops = $.extend(_end_options, end_options);
		$start_datetimepicker.datetimepicker(start_ops).on('changeDate', function(ev){
			if($(this).is('input')){
				$end_datetimepicker.datetimepicker('setStartDate', $(this).val());
			}else{
				$end_datetimepicker.datetimepicker('setStartDate', $(this).find('input').eq(0).val());
			}
		});
		$end_datetimepicker.datetimepicker(end_ops).on('changeDate', function(ev){
			if($(this).is('input')){
				$start_datetimepicker.datetimepicker('setEndDate', $(this).val());
			}else{
				$start_datetimepicker.datetimepicker('setEndDate', $(this).find('input').eq(0).val());
			}
		});
	};

	/**
	 * 获取datetimepicker日期(时间)控件默认属性
	 */
	me._getDatetimePickerDefaultOptions = function(){
		return _options = {
	        language: 'zh-CN',
	        weekStart: 1,
	        todayBtn: true,
			autoclose: true,
			todayHighlight: false,
			forceParse: false,
	        showMeridian: false,
	        clearBtn: false,
	        startDate: null,
	        endDate: null,
			startView: 2,
	        minView: 0,//0:'hour' 1:'day' 2:'month' 3:'year' 4:'decade' the 10-year
			format: 'yyyy-mm-dd hh:ii'
	    };
	};
	
	//echarts
	/**
	 * 初始化柱形/折线控件
	 * 
	 * @param graphic 柱形图/折线图容器
	 * @param options 属性信息
	 */
	me.initChartBarLineX = function(graphic, options){
		var $graphic = app.getJqueryObject(graphic);
		var myChart = echarts.init($graphic[0], config.echarts_theme);
		var _options = {
			title: {
		        text: '',		//主标题
		        subtext: ''		//副标题
		    },	
			//color: ['#3398DB','#2EC7C9'],
		    tooltip: {
		        trigger: 'axis',
		        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
		        	type: 'shadow'        // 默认为直线，line: 直线指示器 ||cross: 十字准星指示器 ||shadow: 阴影指示器
		        }
		    },
		    grid: {
		        left: '3%',
		        right: '4%',
		        bottom: '3%',
		        containLabel: true
		    },
		    toolbox: {
		        show: true,
		        feature: {
		            mark: {show: true},
		            dataView: {show: false, readOnly: false},
//		            magicType: {show: true, type: ['line', 'bar']},
		            restore: {show: true},
		            saveAsImage: {show: true}
		        }
		    },
		    calculable: true,
			legend: {
				y: 10
			},
		    xAxis: [{
	        	type: 'category',		// value: 数值轴，适用于连续数据  ||category: 类目轴  ||time: 时间轴  ||log: 对数轴
	        	axisTick: {
	        		alignWithLabel: true// 类目轴中在 boundaryGap 为 true 的时候有效，可以保证刻度线和标签对齐
	        	}
	        }],
		    yAxis: [{
	        	type: 'value'			// value: 数值轴，适用于连续数据  ||category: 类目轴  ||time: 时间轴  ||log: 对数轴
	        }]
		};
		var ops = options ? $.extend(true, _options, options) : _options;
		myChart.setOption(ops, true);
	};
	/**
	 * 初始化条形/折线控件
	 * 
	 * @param graphic 条形图/折线图容器
	 * @param options 属性信息
	 */
	me.initChartBarLineY = function(graphic, options){
		var $graphic = app.getJqueryObject(graphic);
		var myChart = echarts.init($graphic[0], config.echarts_theme);
		var _options = {
			title: {
				text: '',		//主标题
				subtext: ''		//副标题
			},	
			//color: ['#3398DB','#2EC7C9'],
			tooltip: {
				trigger: 'axis',
				axisPointer: {            // 坐标轴指示器，坐标轴触发有效
					type: 'shadow'        // 默认为直线，line: 直线指示器 ||cross: 十字准星指示器 ||shadow: 阴影指示器
				}
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				containLabel: true
			},
			toolbox: {
				show: true,
				feature: {
					mark: {show: true},
					dataView: {show: false, readOnly: false},
//					magicType: {show: true, type: ['line', 'bar']},
					restore: {show: true},
					saveAsImage: {show: true}
				}
			},
			calculable: true,
			legend: {
				y: 10
			},
			xAxis: [{
		    	type: 'value'			// value: 数值轴，适用于连续数据  ||category: 类目轴  ||time: 时间轴  ||log: 对数轴
	        }],
		    yAxis: [{
		    	type: 'category',		// value: 数值轴，适用于连续数据  ||category: 类目轴  ||time: 时间轴  ||log: 对数轴
		    	axisTick: {
		    		alignWithLabel: true// 类目轴中在 boundaryGap 为 true 的时候有效，可以保证刻度线和标签对齐
		    	}
	    	}]
		};
		var ops = options ? $.extend(true, _options, options) : _options;
		myChart.setOption(ops, true);
	};
	/**
	 * 初始化饼图控件
	 * 
	 * @param graphic 柱形图/折线图容器
	 * @param options 属性信息
	 */
	me.initChartPie = function(graphic, options){
		var $graphic = app.getJqueryObject(graphic);
		var myChart = echarts.init($graphic[0], config.echarts_theme);
		var _options = {
		    title: {
		    	text: '',		//主标题
		        subtext: '',	//副标题
		        x: 'center'
		    },
		    tooltip: {
		        trigger: 'item',
		        formatter: "{a} <br/>{b} : {c} ({d}%)"
		    },
		    legend: {
		        orient: 'vertical',
		        x: 'left',
		        y: 10
		    },
		    toolbox: {
		        show: true,
		        feature: {
		            mark: {show: true},
		            dataView: {show: false, readOnly: false},
		            magicType: {
		                show: true, 
		                type: ['pie', 'funnel'],
		                option: {
		                    funnel: {
		                        x: '25%',
		                        width: '50%',
		                        funnelAlign: 'left',
		                        max: 1548
		                    }
		                }
		            },
		            restore: {show: true},
		            saveAsImage: {show: true, name: '图表'}
		        }
		    },
		    calculable: true
		};
		var ops = options ? $.extend(true, _options, options) : _options;
		myChart.setOption(ops, true);
	};
	/**
	 * 获取鼠标漂浮处html
	 */
	me.getTooltipFormatHtml = function(options){
		var _options = {
			bg_color: '',//背景色
			html: ''//描述
		};
		var ops = options ? $.extend(true, _options, options) : _options;
		return '<span style="display:inline-block;margin-right:5px;'
			+ 'border-radius:10px;width:9px;height:9px;background-color:' 
			+ ops.bg_color + '"></span>'
			+ ops.html;
	};
	//echarts end
})(ctrl);