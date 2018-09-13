$(function(){
	$('.show-right').stop().animate({'opacity':1},600);
//	靠谱新闻
	$(window).scroll(function(){
		var rTop = $(document).scrollTop();
		if(rTop > 1299){
			$('.news-one,.news-three').stop().animate({'marginLeft':0},300);
			$('.news-two').stop().animate({'marginLeft':0},300);
		}
	});
});