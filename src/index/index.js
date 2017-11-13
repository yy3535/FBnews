let MD5=require('md5.js');
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
$(window).scroll(function(){
    if($(window).scrollTop()>=142){
        $(".header-channel-nav").addClass("header-mini");
    }
    if($(window).scrollTop()<142){
        $(".header-channel-nav").removeClass("header-mini");
    }
})
$(".slide").on('mouseenter',function(){
    clearInterval(timer);
});
$(".slide").on('mouseleave',function(){
    isAutoPlay();
});
flags.on('click',function(){
    console.log(index);
    console.log($(this).index());
    hideShowImg(index,$(this).index());
    index=$(this).index();
});
$(".btn-login").on('click',function(){
    console.log("进入登录");
    $(".mask").css('display','block');
    $(".login-dialog").css('display','block');
    $(".mask").on('click',function(){
        $(".mask").css('display','none');
        $(".login-dialog").css('display','none');
    })
    $(".icon-close48").on('click',function(){
        $(".mask").css('display','none');
        $(".login-dialog").css('display','none');
    })
})
$('.login-form').on('submit',function(e){
    e.preventDefault();
    let [username,password]=[this.username.value.trim(),this.psw.value.trim()];
    if(!username||!password){
        $('.error-msg').text('用户名或密码不能为空！').show();
        return;
    }
    password=new MD5().update(password).digest('hex');
    $.ajax({
        url:'/api/user/check',
        method:'post',
        data:{
            username,
            password
        },
        success:function(data){
            //{ success:false ,message:''}
            if(data.success){
                console.log(data);
                $('.error-msg').hide();
                location.reload();
            }else{
                $('.error-msg').text('用户名或密码不正确！').show();
            }
           // console.log('后端返回给前端的数据',data);
        }
    });

});
$(".user-info-box").on('mouseenter',function(){
    $(".user-info-menu").css('display','block');
})
$(".user-info-box").on('mouseleave',function(){
    $(".user-info-menu").css('display','none');
})















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

