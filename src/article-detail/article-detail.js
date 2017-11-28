
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

//回复
$(".comment-reply").on('click',function(){
    console.log($(this).parents("li").find(".reply-input").length);
    if($(this).parents("li").find(".reply-input").length==0){
        /*移除其它回复框*/
        $(".reply-input").remove();
        /*插入这个回复框*/
        var str="<div class='reply-input'><textarea placeholder='回复："+ $(this).parents("li").find(".comment-nickname").html()+"' data-id='"+ userId +"' data-name=''></textarea><p><span class='add-reply-btn'>发表</span></p></div>";
        $(this).parents("li").append(str);
        /*回复框放大缩小*/
        $(".reply-input").on('click',function(event){
            
            $(this).css('height',"115px");
            console.log("获得焦点");
            /*提交回复*/
            $(".add-reply-btn").off('click');
            $(".add-reply-btn").on('click',function(event){
                debugger;
                alert("点击了发表");
                $.ajax({
                    type:'post',
                    url:'/article/detail/saveReply',
                    data:{
                        docid:articleId,
                        from:userId,
                        commentid:$(this).parents("li").data("id"),
                        content:$(this).parents("li").find("textarea").text()
                    },
                    success:function(res){
                        alert("提交成功");
                    }
                });
                event.stopPropagation();    //  阻止事件冒泡
            })
            event.stopPropagation();    //  阻止事件冒泡
        })
        $("body").on('click',function(event){
            $(".reply-input").css('height',"40px");
            console.log("失去焦点");
        })
        
        
    }
    
});
