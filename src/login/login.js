require('!style-loader!css-loader!./login.css');
let MD5=require('md5.js');
$('.login form').on('submit',function(e){
    e.preventDefault();
    let [username,password]=[this.username.value.trim(),this.password.value.trim()];
    if(!username||!password){
        $('#errorMesg').text('用户名或密码不能为空！')
        .show()
        .animate({
            display:'none'
        },1500,function(){
            $(this).hide();
        });

        // setTimeout(function(){
        //     $('#errorMesg').hide();
        // },1500)
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
                location.href='/admin/index';
            }else{
                $('#errorMesg').text('用户名或密码不正确！')
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
