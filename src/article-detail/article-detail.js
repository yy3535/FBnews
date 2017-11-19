
console.log("进入了article-detail.js");
require('!style-loader!css-loader!./article-detail.css');


//绑定事件
//发表评论
$(".add-comment-btn").on('click',function(){
    if(userId==""){
        alert("需要登录才能发表评论!");
    }else{
        //新增评论
        var comment={};
        comment.articleId=articleId;
        comment.userId=userId;
        comment.body=$(".comment-input").val();
        //提交
        $.ajax({
            type:'post',
            url:'/article/detail/saveComment',
            data:comment,
            success:function(res){
                alert(res.message);
                location.reload();
            }
        })
    }
})
