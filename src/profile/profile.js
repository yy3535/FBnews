
console.log("进入了profile.js");
require('!style-loader!css-loader!./profile.css');


//绑定事件
//左侧导航栏
$(".left-wrapper .nav-list li").on('click',function(){
    var index=$(this).index();
    //对应样式修改
    $(".left-wrapper .nav-list li").removeClass("active");
    $(this).addClass("active");
    $(".left-wrapper .nav-list span").css("top",47*index+"px");
    //显示对应的右侧内容
    $(".right-wrapper .nav-show").removeClass("active");
    $($(".right-wrapper .nav-show")[index]).addClass("active");
})