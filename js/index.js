$(function(){
	var mySwiper = new Swiper('.swiper-container', {
        direction: 'horizontal',
        loop: true,
		paginationClickable:true,
        pagination: '.swiper-pagination',
//      nextButton: '.swiper-button-next',
//      prevButton: '.swiper-button-prev',
        loop : true,
        autoplay : 3000,
        autoplayDisableOnInteraction : false,
        lazyLoading: true,
	    lazyLoadingInPrevNext : true, 
	    lazyLoadingInPrevNextAmount: 1
	});
	$('.swiper-container').mouseover(function(){
		mySwiper.stopAutoplay();
	}).mouseout(function(){
		mySwiper.startAutoplay();
	});
    var state = true;
    $(window).scroll(function(){
    	var rTop = $(document).scrollTop();
    	if(rTop > 1900){
    		$('.chat').stop().animate({
    			'opacity':1,
    			'top':80,
    			'left':505
    		},300);
    		$('.famous').stop().animate({
    			'opacity':1,
    			'top':330,
    			'left':200
    		},300);
    		$('.stric').stop().animate({
    			'opacity':1,
    			'top':360,
    			'left':800
    		},300);
    		$('.sldier').stop().animate({
    			'opacity':1,
    			'top':725,
    			'left':500
    		},300);
    	}
    	if(rTop > 1200){
    		var time = null;
			var spanNum = 181,lastNum = 0;
			if(state === false){
				clearInterval(time);	
			}
			if(state === true){
				time = setInterval(addNum,5);	
			}
			function addNum(){
				spanNum += 1;
				lastNum += 1;
				$('#number').html('<span id="number">1' + ',' + spanNum + ',' + lastNum + '</span>');
				if(spanNum > 367 && lastNum > 186){
					clearInterval(time);
				}
				state = false;
			}
    	}
    });
//	底部轮播
	var num = 0;
	var timer = null;
	clearInterval(timer);
	timer = setInterval(autoPlay,2500);
	function autoPlay(){
		$('.slide-indicators li').eq(num).addClass('cont-show').siblings().removeClass('cont-show');
		$('.slide-inner div').eq(num).addClass('show-school').siblings().removeClass('show-school');
		$('.school-detail .school-left').eq(num).addClass('show-school').siblings().removeClass('show-school');
		num++;
		if(num > 1){
			num = 0;
		}
	};
	$('.school-right,.school-left a').mouseover(function(){
		clearInterval(timer)
	}).mouseout(function(){
		timer = setInterval(autoPlay,2500);
	});
	$('.slide-indicators li').click(function(){
		var index = $(this).index();
		$(this).addClass('cont-show').siblings().removeClass('cont-show');
		$('.slide-inner div').eq(index).addClass('show-school').siblings().removeClass('show-school');
		$('.school-detail .school-left').eq(index).addClass('show-school').siblings().removeClass('show-school');
	});
})