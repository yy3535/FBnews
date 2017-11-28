/**
 * 文章评论 表
 */
const mongoose = require('mongoose');
let userSchema= new mongoose.Schema({
    userid:String,//评论用户
    body:String,//评论内容
    time:{//评论发表时间
        type:Date,
        default:Date.now
    },
    replys:[//评论回复
        {
            from:String,
            content:String,
            time:{
                type:Date,
                default:Date.now
            }
        }
    ]
});

module.exports= mongoose.model('Comment', userSchema);