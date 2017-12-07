console.log("进入了index.js");
//定义变量
var timer;
var index=0;
var items=imgs=$(".slide-list .slide-item");
var imgs=$(".slide-list").find("img");
var flags=$(".flag-wrapper .flag");
var page=2;
var load=true;
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

//滚动加载文章
$(window).scroll(function(){

    // 当滚动到最底部以上100像素时， 加载新内容

    if (load&&($(document).scrollTop()>=$(document).height()-$(window).height()-100)) {
        console.log("页数：",page);
        getart(page);
        
        page++;
    }
});

function getart(page){
    $.ajax({
        type: "POST",
        url: "/getPageArticles",
        data: {
            page:page
        },
        success: function(res){
            var row=$('.channel-news');
            if(res!=''){
                var addNewsList="";
                for(var i=0;i<res.length;i++){
                    var addNews=`<a class="item doc style-small-image style-content-middle" href="/article/detail/`+res[i]._id+`" target="_blank" data-docid="0HcP5x1I">
                                    <div class="doc-image-small-wrapper">
                                        <div class="doc-image-box">
                                            <img class="doc-image doc-image-small" src="`+res[i].cover+`">
                                        </div>
                                    </div>
                                    <div class="doc-content">
                                        <div class="doc-content-inline">
                                        <div class="doc-title">`+res[i].title+`</div>
                                        <div class="doc-info">
                                            
                                            <img class="source-profile" src="`+res[i].cover+`">
                                            
                                            
                                            
                                            <span class="source">`+res[i].author+`</span>
                                            
                                            
                                            <span class="comment-count">
                                                    <span id = "sourceId::`+res[i].id+`" class = "cy_cmt_count" ></span>评
                                                    <script id="cy_cmt_num" src="https://changyan.sohu.com/upload/plugins/plugins.list.count.js?clientId=cytk6HpVa">
                                                    </script>
                                            </span>
                                            <span class="date">`+res[i].duration+`</span>
                                            <div class="doc-remove">不感兴趣<span class="iconfont icon-close-half"></span></div>
                                        </div>
                                        </div>
                                    </div>
                                </a>`;
                        addNewsList+=addNews;
                }
                //console.log(addNewsList);
                row.append(addNewsList);
                console.log("加载了第几页：",page);
            }else{
                load=false;
                var noMoreNews=`<div class="loading-tip news-no-more">暂无更多新闻</div>`;
                row.append(noMoreNews);
            }
        }
    })
            
}
$('.split-refresh-btn').bind("click", function(){
    getart(page);
    page++;
});


