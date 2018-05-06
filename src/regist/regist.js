
console.log("进入了regist.js");
let MD5=require('md5.js');
$('.regist form').on('submit',function(e){
    e.preventDefault();
    let [username,password,passwordConfirm,email]=[this.username.value.trim(),this.password.value.trim(),this.passwordConfirm.value.trim(),this.email.value.trim()];
    if(!username||!password){
        $('#errorMesg').text('用户名或密码不能为空！')
        .show()
        .animate({
            display:'none'
        },1500,function(){
            $(this).hide();
        });
        return;
    }
    if(passwordConfirm!==password){
        $('#errorMesg').text('两次输入的密码不一致！')
        .show()
        .animate({
            display:'none'
        },1500,function(){
            $(this).hide();
        });
        return;
    }

    let reg=/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
    let result=email.match(reg);
    if(!result){
        $('#errorMesg').text('邮箱地址不合法！')
        .show()
        .animate({
            display:'none'
        },1500,function(){
            $(this).hide();
        });
        return;
    }
    password=new MD5().update(password).digest('hex');
    alert('开始注册');
    $.ajax({
        url:'/api/user/registe',
        method:'post',
        data:{
            username,
            password,
            email
        },
        success:function(data){
            if(data.success){
                alert("注册成功！");
                location.href='/admin/index';
            }else{
                $('#errorMesg').text(data.message)
                .show()
                .animate({
                    display:'none'
                },2000,function(){
                    $(this).hide();
                });
            }
           // console.log('后端返回给前端的数据',data);
        }
    });
});