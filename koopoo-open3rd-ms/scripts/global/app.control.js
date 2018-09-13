/**
 * 与插（组）件相关(依赖app.config.js、app.common.js)
 */
var ctrl = {};

(function(me){
	var $__me = me;

	/**
	 * 初始化文件上传控件
	 * 
	 * @param fileUpload 文件input
	 * @param options 文件上传属性
	 * @returns
	 */
	me.initFileUpload = function(fileUpload, options) {
		var $fileUpload = app.getJqueryObject(fileUpload);
		var _options = {
			url: null, // 上传地址
			accept_file_types: /(\.|\/)(mov|m4v|mp4|gif|jpe?g|png|webp)$/i,
			replaceFileInput: true,
			max_number_of_files: 1,
			maxFileSize: 10 * 1024 * 1024,
			messages: {
			    maxFileSize: '文件最大不超过10兆',
			    acceptFileTypes: '文件类型不匹配'
			},
			processfail: function (e, data) {
			    var currentFile = data.files[data.index];
			    if (data.files.error && currentFile.error) {
			        // there was an error, do something about it
			        app.alert(currentFile.error);
			    }
			},
			success_fun: null,// 成功回调函数
			fail_fun: null,// 失败回调函数
		};
		var ops = options ? $.extend(_options, options) : _options;
		var params = $fileUpload.attr('data-value');
		if(ops.replaceFileInput){
			$fileUpload.on('focus', function(){
				var $self = $(this);
				var file_name = $self.val();
				var file_flg = $self.attr('op-open-flg');
				if(file_name != null && file_name.length > 0){
					if(file_flg == 1){
						$fileUpload.trigger('change');
						$self.attr('op-open-flg', 0);
					}else{
						$self.attr('op-open-flg', 1);
					}
				}
			});
		}
		$fileUpload.fileupload({
			dataType: 'json',
			formData: function(form) {
				return form.serializeArray();
			},
			replaceFileInput: ops.replaceFileInput,
			autoUpload: true,
			acceptFileTypes: ops.accept_file_types,
			maxNumberOfFiles: ops.max_number_of_files,
			maxFileSize: ops.maxFileSize,
			disableImageResize: /Android(?!.*Chrome)|Opera/.test(window.navigator.userAgent),
			previewMaxWidth: 100,
			previewMaxHeight: 100,
			previewCrop: true,
			url: config.getApiPath(ops.url) + (params?params:''),
			messages: ops.messages,
			processfail: ops.processfail,
			done: function(e, data) {
				if(ops.success_fun instanceof Function) ops.success_fun.call($fileUpload, e, data);
			},
			progressall: function(e, data) {
				var progress = parseInt(data.loaded / data.total * 100, 10);
				app.blockUI('正在上传... '+ progress +'%');
				if (progress == 100) {
					app.unblockUI();
				}
			}
		});
		$fileUpload.error(function(jqXHR, textStatus, errorThrown) {
			if (errorThrown === 'abort') {
				app.alert('上传被取消');
			}else{
            app.alert('上传错误！');
        }
        if(ops.fail_fun) ops.fail_fun(e, data, $fileUpload);
        	return;
		});
		$fileUpload.removeAttr('disabled');
	};
	
	/**
	 * 删除图集中的图片
	 * 
	 * @param obj
	 */
	me.removeImg = function(obj){
		var img_id = $(obj).attr('data-id');
		app.confirm({
			content: '确认要执行操作吗？',
			okCallback: function(){
				ajax.deleteAjaxData({
					url: '/ms/pictures/'+img_id,
					success: function(){
						var $atlas = $(obj).parent().parent();//图集层
						$(obj).parent().remove();
						var $langth = $atlas.children('div.img_item').length;
						if($langth < 1){
							$atlas.children('img').attr('src',config.getDefImgUrl()).show();
						}
					}
				});
			}
		});
	}
	
	/**
	 * 初始化grid控件
	 * 
	 * @param gridTable 数据容器
	 * @param gridPager 分页容器
	 * @param options grid属性信息
	 */
	me.initGrid = function(gridTable, gridPager, options){
		var $gridTable = app.getJqueryObject(gridTable);
		var $gridPager = app.getJqueryObject(gridPager);
		var gtid = $gridTable.attr('id');
		var gpid = $gridPager.attr('id');
		config.temp.grid.row_css[gtid]={};
		config.temp.grid.col_map[gtid]={};
		var $rowCssFun = function(grid){
			//获取列表数据
			var row_css = config.temp.grid.row_css[gtid];
			if(row_css && Object.getOwnPropertyNames(row_css).length > 0){
				$.each(row_css, function (row_id, css) {
					if(css && Object.getOwnPropertyNames(css).length > 0){
						grid.find('tr[id="'+row_id+'"]').css(css);
					}
				});
			}
			return true;
		};
		
		//options为空,则组装colNames
		if(options){
			if(options.url){
				options.url = config.getApiPath(options.url);
			}
			if(!options.colNames && options.colModel){
				var colNames = [];
				var colMap = {};
				options.colModel.map(function(item, index){
					colNames.push(item.title);
					colMap[item.name] = item.title;
					delete item.title;
				});
				options.colNames = colNames;
				config.temp.grid.col_map[gtid] = colMap;
			}
		}
		
		var _options = {
			//自定义
			is_show_record: true, //是否显示查看记录
			is_show_top: true, //是否显示顶部分页栏
			nav_button_arr: [], //增加按钮列表
			
			url: '',
			datatype: 'json',
			mtype: 'GET',
			altRows: true,
			styleUI: 'Bootstrap',// jQueryUI Bootstrap
			altclass: 'ui-state-alt-row',
			autowidth: true,//自适应父容器
			shrinkToFit: false,//通过colModel的属性指定列宽
			viewsortcols:[true,'vertical',true],
			height: 330,
			// height: 330,
			viewrecords: true,
			rowNum: 10,//每一页的行数
			rowList:[10,30,50,100],
			pager: $gridPager,
			toppager: false,
			cloneToTop: false,
			prmNames: {//请求参数格式
				page: 'pageNumber',
				rows: 'pageSize', 
				sort: '_sidx',
				order: '_sord'
			},
			loadComplete: function(data) {
                var $bdiv = $('#gview_'+gtid).find('.ui-jqgrid-bdiv');
                var scrollTop =  $bdiv.scrollTop();
                if(scrollTop > 0){
                    $bdiv.animate({scrollTop: (scrollTop - 1)+'px'}, 1);
                    $bdiv.animate({scrollTop: scrollTop+'px'}, 1);
                }

				config.temp.grid.data[$(this).attr('id')] = data;
			},
			gridComplete: function(){
				$rowCssFun($(this));
				if(typeof window.resizeMainSize == 'function') {
					window.myGridObject = $(this);
					window.resizeMainSize($(this));
				}
			},
			ondblClickRow: function (rowid, iRow, iCol, e){
				var table = this;
				var rw = $(table).getRowData(rowid);
				var colMap = config.temp.grid.col_map[gtid];
				$__me.viewGridRowRecord(colMap, rw);
			},
			beforeSelectRow: function(rowid, e){
				$rowCssFun($(this));
				return true;
			},
			jsonReader: {//读取后端json数据的格式
				root: 'result',//记录列表
				total: 'lastPageNumber',//总共页数
				page: 'thisPageNumber',//当前是哪一页
				records: 'totalCount'//总共记录数
			},
			beforeRequest: function(){
				config.temp.grid.row_css[gtid]={};
				var table = this;
				var postData = $(table).getGridParam('postData');
				var sidx = postData['_sidx'];
				var sord = postData['_sord'];
				if(sidx){
					if(sord){
						postData['sortColumns'] = sidx + ' ' + sord;
					}else{
						postData['sortColumns'] = sidx;
					}
					$(table).setGridParam('postData', postData);
				}
			},
			hidegrid: false,
//			multiselect: true,
//			multikey: 'ctrlKey',
//	      	multiboxonly: true,
			loadError: app.ajaxError
		};
		
		var ops = options ? $.extend(true, _options, options) : _options;
		if(ops.is_show_top){
			ops.toppager = true;
			ops.cloneToTop = true;
		}
		//绑定grid
		var _grid = $gridTable.jqGrid(ops);
		_grid.navGrid('#'+gpid,{ 	
			//navbar options
			add: false,
			edit: false,
			del: false,
			view: false,
			search: false,
			refresh: false,
			refreshicon: 'jg-icon fa fa-refresh green',
			refreshtext: '刷新',
			refreshtitle: '刷新',
			cloneToTop: (ops.is_show_top ? true : false)
		});
		
		if(ops.is_show_record){
			var detail_button_option = {
				caption: '详情',
				title: '查看行详情',
				buttonicon: 'jg-icon fa fa-search-plus light-blue',
				onClickButton: function(){
					var rw = $__me.getSingleSelectedRowRecord(gridTable);
					if(!rw) return false;
					var colMap = config.temp.grid.col_map[gtid];
					$__me.viewGridRowRecord(colMap, rw);
				},
				position: 'last'//first last
		    };
			_grid.navButtonAdd('#'+gpid, detail_button_option);
			if(ops.is_show_top) _grid.navButtonAdd('#'+gtid+'_toppager', detail_button_option);
		}
		if(ops.nav_button_arr){
			ops.nav_button_arr.map(function(nav_button_ops, index){
				_grid.navButtonAdd('#'+gpid, nav_button_ops);
				if(ops.is_show_top) _grid.navButtonAdd('#'+gtid+'_toppager', nav_button_ops);
			});
		}

		//大小调整时
		$(window).on('resize.jqGrid', function () {
			var parent_column = $gridTable.closest('[class*="col-"]');
			$gridTable.setGridWidth(parent_column.width());
		})
		//触发大小调整
		$(window).triggerHandler('resize.jqGrid');
		//去除莫名其妙的grid弹出框
		$('#alertmod_'+gtid).remove();
		//冻结列
		_grid.jqGrid('setFrozenColumns');
		//添加监控页面窗口变化的方法
		$(window).resize(function(){
			_grid.jqGrid('destroyFrozenColumns');
			_grid.jqGrid('setFrozenColumns');
		});
		return _grid;
	};
	
	/**
	 * 查看grid记录行信息
	 * 
	 * @param colMap 列名->列标题
	 * @param rw 行记录
	 */
	me.viewGridRowRecord = function(colMap, rw){
		if(!colMap || !rw){
			return ;
		}
		
		var dataList = [];
		var col_index = 0;
		$.each(rw, function (key,value) {
			if(typeof(key) == 'undefined' || key == 'undefined' || !key){
				return ;
			}
			dataList.push({
				key: colMap[key],
				value: value
//				value: (value == (null||'null') ? '' : value)
			});
			col_index ++;
		});
		//问卷编辑里面有这个东西,所以要去掉
//		if(dataList[1].key.indexOf("操作") > -1){
//			dataList.splice(0,2);
//		}
		$__me.viewGridRowRecordData(dataList);
	};
	
	/**
	 * 查看记录数据
	 * 
	 * @param dataList 数据列表
	 */
	me.viewGridRowRecordData = function(dataList){
		if(!dataList){return ;}
		
		var html = [];
		var flag = false;
		html.push('<table class="table table-hover table-bordered table-condensed">');
		html.push('<tbody>');
		dataList.map(function(item, index){
			if(index % 4 == 0){
				// html.push('<tr class="success">');
				html.push('<tr>');
			}else if(index % 2 == 0){
				// html.push('<tr class="active">');
				html.push('<tr class="ui-state-alt-row">');
			}
			html.push('<td class="detail-title">'+item.key+'：</td>');
			html.push('<td class="detail-content">'+item.value+'</td>');
			if(index % 2 == 1){
				flag = true;
				html.push('</tr>');
			}else{
				flag = false;
			}
		});
		if(!flag) html.push('<td></td><td></td></tr>');
		html.push('</tbody>');
		html.push('</table>');
		$(config.global_part).find('.part-body').html(html.join(''));
		app.toggleView(config.global_part);
	};

	/**
	 * 获取grid所选单行记录
	 * 
	 * @param gridTable 数据容器
	 */
	me.getSingleSelectedRowRecord = function(gridTable){
		var $gridTable = app.getJqueryObject(gridTable);
		
		var rowid = null;
		if($gridTable.getGridParam('multiselect')){
			var rowids = $gridTable.getGridParam('selarrrow');
			if(!rowids || rowids.length < 1){
				app.show({content:'请选择记录行',type:3});
				return null;
			}else if(rowids.length > 1){
				app.show({content:'请选择单条记录行',type:3});
				return null;
			}
			rowid = parseInt(rowids[0]);
		}else{
			rowid = $gridTable.getGridParam('selrow');
			if(!rowid){
				app.show({content:'请选择记录行',type:3});
				return null;
			}
		}
		
		return $gridTable.getRowData(rowid);
	};

	/**
	 * 获取grid行数据
	 * 
	 * @param gridTable 数据容器
	 * @param rowid 行ID（不填表示查所有行）
	 */
	me.getRowData = function(gridTable, rowid){
		var $gridTable = app.getJqueryObject(gridTable);
		var gridData = config.temp.grid.data[$gridTable.attr('id')];
		var rows = [];
		if(gridData || gridData.result){
			rows = gridData.result;
		}
		
		if(rowid){
			if(rows.length < 1){
				return {};
			}else{
				return rows[rowid - 1]
			}
		}else{
			return rows;
		}
	}

	/**
	 * 获取grid所选单行数据
	 * 
	 * @param gridTable 数据容器
	 */
	me.getSingleSelectedRowData = function(gridTable){
		var $gridTable = app.getJqueryObject(gridTable);
		
		var rowid = null;
		if($gridTable.getGridParam('multiselect')){
			var rowids = $gridTable.getGridParam('selarrrow');
			if(!rowids || rowids.length < 1){
				app.show({content:'请选择记录行',type:3});
				return null;
			}else if(rowids.length > 1){
				app.show({content:'请选择单条记录行',type:3});
				return null;
			}
			rowid = parseInt(rowids[0]);
		}else{
			rowid = $gridTable.getGridParam('selrow');
			if(!rowid){
				app.show({content:'请选择记录行',type:3});
				return null;
			}
		}
		
		var gridData = config.temp.grid.data[$gridTable.attr('id')];
		if(gridData || gridData.result){
			return gridData.result[rowid - 1];
		}else{
			return $gridTable.getRowData(rowid);
		}
	};

	/**
	 * 获取grid所选多行数据
	 * 
	 * @param gridTable 数据容器
	 */
	me.getMultiSelectedRowData = function(gridTable){
		var $gridTable = app.getJqueryObject(gridTable);
		var rowids = $gridTable.getGridParam('selarrrow');
		if(!rowids || rowids.length < 1){
			app.show({content:'请选择记录行',type:3});
			return null;
		}
		var gridData = config.temp.grid.data[$gridTable.attr('id')];
		
		var arr = [];
		if(gridData || gridData.result){
			rowids.map(function(rowid, index){
				arr.push(gridData.result[rowid - 1]);
			});
		}else{
			rowids.map(function(rowid, index){
				arr.push($gridTable.getRowData(rowid));
			});
		}
		return arr;
	};
	
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
	 * 初始化日期(日期)控件
	 * 
	 * @param start_datepicker datepicker容器(起始)
	 * @param start_options datepicker属性信息(起始)
	 * @param end_datepicker datepicker容器(结束)
	 * @param end_options datepicker属性信息(结束)
	 */
	me.initDate = function(start_datepicker, start_options,
			end_datepicker, end_options){
		var _options = {
            startView: 2,
			minView: 2,//0:'hour' 1:'day' 2:'month' 3:'year' 4:'decade' the 10-year
			format: 'yyyy-mm-dd'
		};
		var start_ops = $.extend(_options, start_options);
		var end_ops = $.extend(_options, end_options);
		$__me.initDateTime(start_datepicker, start_ops, end_datepicker, end_ops);
	};

	/**
	 * 初始化日期(时间)控件
	 * 
	 * @param start_datetimepicker datetimepicker容器(起始)
	 * @param start_options datetimepicker属性信息(起始)
	 * @param end_datetimepicker datetimepicker容器(结束)
	 * @param end_options datetimepicker属性信息(结束)
	 */
	me.initDateTime = function(start_datetimepicker, start_options,
			end_datetimepicker, end_options){
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
		var _options = {
	        language: 'zh-CN',
	        weekStart: 1,
	        todayBtn: 'linked',
			autoclose: 1,
			todayHighlight: 1,
			forceParse: 0,
	        showMeridian: 0,
	        clearBtn: false,
	        startDate: null,
	        endDate: null,
            startView: 0,
	        minView: 0,//0:'hour' 1:'day' 2:'month' 3:'year' 4:'decade' the 10-year
			format: 'yyyy-mm-dd hh:ii'
	    };
		return _options;
	};
	
	/**
	 * 初始化日期(日期)控件
	 * 
	 * @param start_laydate laydate容器(起始)
	 * @param start_options laydate属性信息(起始)
	 * @param end_laydate laydate容器(结束)
	 * @param end_options laydate属性信息(结束)
	 */
	me.initLayDate = function(start_laydate, start_options, end_laydate, end_options){
		var _options = {
			istime: false,
			format: 'YYYY-MM-DD'
		};
		var start_ops = $.extend(_options, start_options);
		var end_ops = $.extend(_options, end_options);
		$__me.initLayDateTime(start_laydate, start_ops, end_laydate, end_ops);

		//解决IE下显示的问题
		if($.browser.ie){
			$(start_laydate,end_laydate).on('click', function(){
				var docHeight = $(document).outerHeight();
				var inputTop = $(this).offset().top;
				var laydateHeight = $('#laydate_box').outerHeight();
				var top = inputTop + $(this).outerHeight();

				// console.log(docHeight, inputTop, laydateHeight);
				if(docHeight - inputTop - document.body.scrollTop < laydateHeight) { // 底部的高度不够
					top = inputTop - laydateHeight - 2;
				} else {
					top += 2;
				}

				$('#laydate_box').css('top', top);
			});
		}
	}
	
	/**
	 * 初始化日期(时间)控件
	 * 
	 * @param start_laydatetime laydate容器(起始)
	 * @param start_options laydate属性信息(起始)
	 * @param end_laydatetime laydate容器(结束)
	 * @param end_options laydate属性信息(结束)
	 */
	me.initLayDateTime = function(start_laydatetime, start_options,
			end_laydatetime, end_options){
		var _start_options = $__me._getLayDateDefaultOptions();
		var _end_options = $__me._getLayDateDefaultOptions();
		var $start_laydatetime = app.getJqueryObject(start_laydatetime);
		var $end_laydatetime = app.getJqueryObject(end_laydatetime);
		
		if(!start_laydatetime || $start_laydatetime.length < 1){
			return;
		}
		
		//开始日期
		var start_ops = $.extend(_start_options, start_options);
		start_ops.elem = '#'+$start_laydatetime.attr('id');
		if(!end_laydatetime || $end_laydatetime.length < 1){
			// return laydate(start_ops);
			laydate(start_ops);
			if(start_ops.clear_default_val){
				$start_laydatetime.val('');
			}
			return ;
		}
		
		//结束日期
		var end_ops = $.extend(_end_options, end_options);
		end_ops.elem = '#'+$end_laydatetime.attr('id');
		
		var start_choose = start_ops.choose;
		start_ops.choose = function(date){
			end_ops.min = date; //开始日选好后，重置结束日的最小日期
			end_ops.start = date; //将结束日的初始值设定为开始日
			if(start_choose) start_choose();
		};
		var end_choose = end_ops.choose;
		end_ops.choose = function(date){
			start_ops.max = date; //结束日选好后，重置开始日的最大日期
			if(end_choose) end_choose();
		};
		laydate(start_ops);
		laydate(end_ops);
		
		if(start_ops.clear_default_val){
			$start_laydatetime.val('');
		}
		if(end_ops.clear_default_val){
			$end_laydatetime.val('');
		}
	};
	
	/**
	 * 获取laydate日期(时间)控件默认属性
	 */
	me._getLayDateDefaultOptions = function(){
		var _options = {
			//自定义
			clear_default_val: true, //是否清空默认值
			
			elem: '#__id', //需显示日期的元素选择器
		    event: 'click', //触发事件
		    format: 'YYYY-MM-DD hh:mm:ss', //日期格式
		    istime: true, //是否开启时间选择
		    isclear: false, //是否显示清空
		    istoday: true, //是否显示今天
		    issure: true, //是否显示确认
		    festival: true, //是否显示节日
		    min: '1900-01-01 00:00:00', //最小日期
		    max: '2099-12-31 23:59:59', //最大日期
		    start: '', //开始日期
		    fixed: false, //是否固定在可视区域
		    zIndex: 99999999, //css z-index
		    choose: function(dates){ //选择好日期的回调
	
		    }
		};
		return _options;
	};

	/**
	 * 初始化日期(时间)控件(Jquery DateTimePicker)
	 *
	 * @param start_dpdatetime DateTimePicker容器(起始)
	 * @param start_options DateTimePicker属性信息(起始)
	 * @param end_dpdatetime DateTimePicker容器(结束)
	 * @param end_options DateTimePicker属性信息(结束)
	 */
	me.initDPDateTime = function(start_dpdatetime, start_options,
			end_dpdatetime, end_options){
		var _start_options = $__me._getDPDateDefaultOptions();
		var _end_options = $__me._getDPDateDefaultOptions();
		var $start_dpdatetime = app.getJqueryObject(start_dpdatetime);
		var $end_dpdatetime = app.getJqueryObject(end_dpdatetime);

		if(!start_dpdatetime || $start_dpdatetime.length < 1){
			return;
		}

		//开始日期
		var start_ops = $.extend(_start_options, start_options);
		if(!end_dpdatetime || $end_dpdatetime.length < 1){
           return $start_dpdatetime.datetimepicker(start_ops);
		}

		//结束日期
		var end_ops = $.extend(_end_options, end_options);

		var start_onShow = start_ops.onClose;
		start_ops.onClose = function(ct,$i){
			end_ops.minDate = ct.format('yyyy-MM-dd'); //开始日选好后，重置结束日的最小日期
			end_ops.minTime = ct.format('HH:mm:ss'); //开始日选好后，重置结束日的最小日期
			end_ops.startDate = ct.format('yyyy-MM-dd'); //将结束日的初始值设定为开始日
			if(start_onClose) start_onClose();
		};
		var end_onClose = end_ops.onClose;
		end_ops.onClose = function(ct,$i){
			start_ops.maxDate = ct.format('yyyy-MM-dd'); //结束日选好后，重置开始日的最大日期
			start_ops.maxTime = ct.format('HH:mm:ss'); //结束日选好后，重置开始日的最大日期
			if(end_onClose) end_onClose();
		};
        $start_dpdatetime.datetimepicker(start_ops);
        $end_dpdatetime.datetimepicker(end_ops);
	};

	/**
	 * 获取DateTimePicker日期(时间)控件默认属性
	 */
	me._getDPDateDefaultOptions = function(){
		var _options = {
			//自定义
			showClearButton: true, //是否显示清空按钮

            lang: 'zh',//支持语言
            format:'Y-m-d H:i:s',//日期格式
            formatDate:'Y-m-d',//mindate和maxdate的日期格式
            formatTime: 'H:i:s',//mindate和maxdate的日期(时间)格式
            step: 1,//展示的时间最小颗粒(分钟)
            timepicker: true, //是否开启时间选择
            datepicker: true, //是否开启日期选择
            weeks: false, //是否开启周
            theme: 'default', //主题
            minDate: '1900-01-01', //最小日期
            maxDate: '2099-12-31', //最大日期
            minTime: '00:00:00', //最小时间
            maxTime: '23:59:59', //最大时间
            startDate: '', //开始日期
            defaultDate: '', //默认日期
            defaultTime: '', //默认时间
            onShow: function(ct,$i){//显示日期控件
			},
            onClose: function(ct,$i){//隐藏日期控件
			}
		};
		return _options;
	};

	/**
	 * 初始化UEditor控件
	 * @param ue UEditor容器
	 * @param options UE属性信息
	 */
	me.initUEditor = function(ue, options){
		var $ue = app.getJqueryObject(ue);
		var _options = {
			//关闭字数统计
			wordCount : true,
			maximumWords : 5000,
			autoHeightEnabled : false,
			elementPathEnabled : false, //关闭elementPath
			enableContextMenu: false,
			//默认的编辑区域高度
//			initialFrameWidth : 680,
			initialFrameHeight : 400,
			initialCodeMirrorHeight: 500, //源码编辑区域的高度
			initialContent: '',
			allowDivTransToP: false //阻止div标签自动转换为p标签
		};
		var ops = options ? $.extend(_options, options) : _options;
		var _ue = UE.getEditor($ue.attr('id'), ops);
		return _ue;
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