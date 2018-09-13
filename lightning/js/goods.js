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
//	品牌会展示轮播
	$("#myCarousel").carousel('cycle');
	$("#myCarousel1").carousel('cycle');
	$(window).scroll(function(){
//		var state = true;
//		判断页面是否重新加载,这里后期需要继续判断
		var rollTop = $(document).scrollTop();
		if(rollTop>199){
			$('.slide-left').stop().animate({'left':0},300)
		}
	});
});