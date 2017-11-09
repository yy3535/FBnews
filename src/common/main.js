
require('bootstrap');
require('BOOTSTRAP_CSS');
require('FONTAWESOME');
require('STYLE_CSS');

//实现：访问login  就自动帮我引入login.js
//按需加载
let modelPath=$('[data-main]').data('main');//login/login
console.log(modelPath)
if(modelPath){
   //异步引入模块
   import('../'+modelPath)
   .then(model=>{
       console.log('加载模块成功',model);
   }).catch(err=>{
       console.log('模块加载失败',err);
   })
};
//不是后台界面或者登陆界面
if(!location.pathname.startsWith('/admin')&&!location.pathname.startsWith('/login')){
   require('jquery-pjax');
   $(document).pjax('a.pjax','#main');
}

//tab标签变色
$(".sidebar-menu li").removeClass("active");
switch(location.href){
    case "http://localhost:3000/admin/index":
        $($(".sidebar-menu li")[0]).addClass("active");
        break;
    case "http://localhost:3000/admin/user":
        $($(".sidebar-menu li")[1]).addClass("active");
        break;
    default:
        $($(".sidebar-menu li")[0]).addClass("active");
        break;
}

//Enable sidebar toggle
$("[data-toggle='offcanvas']").click(function(e) {
    e.preventDefault();
    //alert("触发");
    //If window is small enough, enable sidebar push menu
    if ($(window).width() <= 992) {
        $('.row-offcanvas').toggleClass('active');
        $('.left-side').removeClass("collapse-left");
        $(".right-side").removeClass("strech");
        $('.row-offcanvas').toggleClass("relative");
    } else {
        //Else, enable content streching
        $('.left-side').toggleClass("collapse-left");
        $(".right-side").toggleClass("strech");
    }
});

//在入口文件加入下面这行代码，可以实现  修改了js文件后，ajax刷新
//不加的话  修改代码后整页直接刷新
/*
if(module.hot){
    module.hot.accept();
}
*/
