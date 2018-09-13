$(function(){    
//  小程序
	$("#myCarousel12").carousel('cycle');
    $(".mask").hover(function(){
        $(this).stop().animate({"opacity":"1"},450);
    },function(){
        $(this).stop().animate({"opacity":"0"},450)
    });
    
    
//  行业模版
	var arr = [];
	$("#myCarousel2").carousel('cycle');
	$(".industry-list").each(function(index){
		$(this).click(function(e){
			if(e.stopPropagation){
				e.stopPropagation();
			}else {
				return false;
			}
			var index = $(this).index();
			if(index == 0){
				$("#myCarousel").carousel('cycle');
			}
			$('.decsion').css('opacity',1);
			$('.industry-marks').css('display','block');
			$('.sel-show').eq(index).addClass('content').siblings().removeClass('content');
			$('.right-use').eq(index).addClass('shows').parent().siblings().children().removeClass('shows');
			$("#myCarousel" + index).carousel(0);
			$("#myCarousel" + index).carousel('cycle');
			arr.push(index);
			if(arr.length >= 2){
				var newArr = arr.slice(arr.length-2,arr.length);
				$("#myCarousel" + newArr[0]).carousel(0);
				$("#myCarousel" + newArr[0]).carousel({
					pause: true,
					interval: false
				});
				$("#myCarousel" + newArr[1]).carousel(0);
				$("#myCarousel" + newArr[1]).carousel('cycle');
			}
		});
	});
	$('.model-box').click(function(){
		$('.right-use').removeClass('shows');
	});
	
//	$('.show-details').click(function(event) {
//		event.stopPropagation()
//	})
//	$('.show-detail').click(function(e){
//		if(e.stopPropagation){
//			e.stopPropagation();
//		}else {
//			return false;
//		}
//	});
	$('.industry-marks').click(function(event){
		var x = event.clientX
		var y = event.clientY
		if (x>55 && x<315 && y>95&&y<560 ||$('.industry-marks').height()<=0)
			return
		$(this).css('display','none');
	});
	
	$('.video-item').hover(function(){
		$(this).children().children('svg').stop().animate({
			'width':100,
			'height':60
		},300).animate({
			'width':121,
			'height':81
		},300)
	},function(){
		$(this).children().children('svg').stop().animate({
			'width':121,
			'height':81
		},300)
	});
	
})