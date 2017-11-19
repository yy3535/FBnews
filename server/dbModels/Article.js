/**
 * 文章 表
 */
const mongoose = require('mongoose');
let userSchema= new mongoose.Schema({
    title:String,//文章标题
    author:{
        type:String,
        default:"佚名"
    },//文章作者
    body:String,//文章内容
    cover:String,//文章封面
    comments:[  //文章评论
        {
            userid:String,//评论用户
            body:String,//评论内容
            time:{//评论发表时间
                type:Date,
                default:Date.now
            }
        }
    ],
    time:{ //文章发布时间，默认为当前时间
        type:Date,
        default:Date.now()
    },
    duration:String//间隔时间
});

module.exports= mongoose.model('Article', userSchema);