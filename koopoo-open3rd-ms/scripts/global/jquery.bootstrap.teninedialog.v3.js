/*
 * teninedialog 1.2.0
 * Copyright (c) 2014 彼岸之远  http://www.xnwai.com/
 * Date: 2014-12-10
 * 针对bootstrap模态对话框的二次封装。
 */
(function($) {
	$.fn.teninedialog = function(options) {
		var defaults = {
			title: '标题',
			content: '',
			url: '', //远程URL
			showCloseButton: true, //显示关闭按钮
			otherButtons: [], //其他按钮文本，样式默认,["确定","取消"]
			otherButtonStyles: [], //其他按钮的样式，['btn-primary','btn-primary'],bootstrap按钮样式
			bootstrapModalOption: {}, //默认的bootstrap模态对话框参数
			dialogShow: function() {}, //对话框即将显示事件
			dialogShown: function() {}, //对话框已经显示事件
			dialogHide: function() {}, //对话框即将关闭
			dialogHidden: function() {}, //对话框已经关闭事件
			clickButton: function(sender, modal, index) {} //选中按钮的序号，排除关闭按钮。sender:按钮jquery对象，model:对话框jquery对象,index:按钮的顺序,otherButtons的数组下标
		};
		var options = $.extend(defaults, options);
		var modalID = '';
		var loadimg = "";
		if (options.content == '') {
			options.content = '<img id="ajax-loader" style="display:none" height="32" width="32" src="' + loadimg + '" />正在获取数据...';
		}

		//生成一个惟一的ID
		function getModalID() {
			var d = new Date();
			var vYear = d.getFullYear();
			var vMon = d.getMonth() + 1;
			var vDay = d.getDate();
			var h = d.getHours();
			var m = d.getMinutes();
			var se = d.getSeconds();
			var sse = d.getMilliseconds();
			return 't_' + vYear + vMon + vDay + h + m + se + sse;
		}

		$.fn.extend({
			closeDialog: function(modal) {
				var modalObj = modal;
				modalObj.modal('hide');
			}
		});

		return this.each(function() {
			var obj = $(this);
			modalID = getModalID();

			$(this).attr("data-target", modalID);

			//top:200px;     background-color: #438EB9; 5998FE
			var tmpHtml = '<div class="modal fade" style="top:200px;" id="{ID}" tabindex="-1" role="dialog" aria-labelledby="myModalLabel_{ID}" aria-hidden="true"><div class="modal-dialog"><div class="modal-content">'+
				'<div class="modal-header" style="background-color: #438EB9;color:#FFF;"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h4 class="modal-title" id="myModalLabel_{ID}">{title}</h4></div><div class="modal-body" id="body_{ID}" style="overflow-y: auto;max-height: 600px;">{body}</div><div class="modal-footer"><img id="ajax-loader" style="display:none" height="32" width="32" src="' + loadimg + '" />{button}</div></div></div></div>';
			var buttonHtml = '<button class="btn btn-danger" data-dismiss="modal" aria-hidden="true">关闭</button>';
			if (!options.showCloseButton && options.otherButtons.length > 0) {
				buttonHtml = '';
			};
			//生成按钮
			var btnClass = 'cls-' + modalID;
			for (var i = 0; i < options.otherButtons.length; i++) {
				buttonHtml += '<button buttonIndex="' + i + '" class="' + btnClass + ' btn ' + options.otherButtonStyles[i] + '">' + options.otherButtons[i] + '</button>';
			}
			//替换模板标记
			tmpHtml = tmpHtml.replace(/{ID}/g, modalID).replace(/{title}/g, options.title).replace(/{body}/g, options.content).replace(/{button}/g, buttonHtml);
			$(obj).append(tmpHtml);

			var modalObj = $('#' + modalID);
			//绑定按钮事件,不包括关闭按钮
			$('.' + btnClass).click(function() {
				var index = $(this).attr('buttonIndex');
				options.clickButton($(this),modalObj,index);
			});
			//绑定本身的事件
			modalObj.on('show.bs.modal', function() {
				//异步加载远程URL
				if (options.url != '') {
					$('#ajax-loader').show();
					$.ajax({
						type: "get",
						url: options.url,
						data: "dialogModalId=" + modalID + "&ajaxloader=ajax-loader",
						success: function(data) {
							$('#ajax-loader').hide();
							$('#body_' + modalID).html(data);
						},
						error: function(e) {
							$('#ajax-loader').hide();
							$('#body_' + modalID).html("加载失败!");
						}
					});
				} else {
					$('#body_' + modalID).html(options.content);
				}
				options.dialogShow();
			});
			modalObj.on('shown.bs.modal', function() {
				options.dialogShown();
			});
			modalObj.on('hide.bs.modal', function() {
				options.dialogHide();
			});
			modalObj.on('hidden.bs.modal', function() {
				options.dialogHidden();
				obj.removeAttr("data-target");
				modalObj.remove();
			});
			modalObj.modal(options.bootstrapModalOption);
		});

	};


	$.extend({
		teninedialog: function(options) {
			$("body").teninedialog(options);
		}
	});

})(jQuery);