(function($){  
$.fn.extend({   
	//将可选择的变量传递给方法
    bilateralTransfer: function(options) {  
        //设置默认值并用逗号隔开
        var defaults = {  
        	left: $(this).find('[move="left"]'),
        	rightAll: $(this).find('[move="rightAll"]'),
        	rightSelected : $(this).find('[move="rightSelected"]'),
        	leftSelected : $(this).find('[move="leftSelected"]'),
        	leftAll : $(this).find('[move="leftAll"]'),
			right: $(this).find('[move="right"]'),
			//事件
			rightAllEventFun: null,
			rightEventFun: null,
			leftEventFun: null,
			leftAllEventFun: null
        }  
        var _ops =  $.extend(defaults, options);  
        var _init = function () {
	    	_initRightAll();
	    	_initRightSelected();
	    	_initLeftSelected();
	    	_initLeftAll();
	    }
        
        var _initRightAll = function(){
        	$(_ops.rightAll).bind('click', function(){
        		var option = $(_ops.left).find('option');
				if (option) {
					option.appendTo(_ops.right);
				}
				if(_ops.rightAllEventFun) _ops.rightAllEventFun(option);
        	});
        }
        var _initRightSelected = function(){
        	$(_ops.rightSelected).bind('click', function(){
        		var option = $(_ops.left).find('option:selected');
				if (option) {
					option.appendTo(_ops.right);
				}
				if(_ops.rightEventFun) _ops.rightEventFun(option);
        	});
        }
        var _initLeftSelected = function(){
        	$(_ops.leftSelected).bind('click', function(){
        		var option = $(_ops.right).find('option:selected');
				if (option) {
					option.appendTo(_ops.left);
				}
				if(_ops.leftEventFun) _ops.leftEventFun(option);
        	});
        }
        var _initLeftAll = function(){
        	$(_ops.leftAll).bind('click', function(){
        		var option = $(_ops.right).find('option');
				if (option) {
					option.appendTo(_ops.left);
				}
				if(_ops.leftAllEventFun) _ops.leftAllEventFun(option);
        	});
        }
        
     	// 启动插件
		_init();

		// 链式调用
    		return this;
        }  
    });  
})(jQuery);