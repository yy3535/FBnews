console.log("进入了index.js");
//定义变量
var timer;
var index=0;
var items=imgs=$(".slide-list .slide-item");
var imgs=$(".slide-list").find("img");
var flags=$(".flag-wrapper .flag");
//自动播放
isAutoPlay();
/**
 * 绑定事件
 */
//首页导航栏变换
$(window).scroll(function(){
    if($(window).scrollTop()>=142){
        $(".header-channel-nav").addClass("header-mini");
    }
    if($(window).scrollTop()<142){
        $(".header-channel-nav").removeClass("header-mini");
    }
})
//轮播图
$(".slide").on('mouseenter',function(){
    clearInterval(timer);
});
$(".slide").on('mouseleave',function(){
    isAutoPlay();
});
flags.on('click',function(){
    hideShowImg(index,$(this).index());
    index=$(this).index();
});

/**
 * 自动播放
 */
function isAutoPlay(){
    timer=setInterval(function(){
        if(index!=3){            
            hideShowImg(index,index+1);
            index+=1;
        }else{
            hideShowImg(index,0);
            index=0;
        }


        
    },3000);
}
/**
 * 轮播
 */
function hideShowImg(hideIndex,showIndex){         
    $(imgs[hideIndex]).css('opacity',0);
    $(imgs[showIndex]).css('opacity',0.3);
    items[hideIndex].style.display='none';
    items[showIndex].style.display='block';
    $(flags[hideIndex]).removeClass("active");
    $(flags[showIndex]).addClass("active");
    $(imgs[showIndex]).animate({
        opacity:1
    },1500);
}

