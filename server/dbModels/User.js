const mongoose = require('mongoose');
//创建一张集合，schema
let userSchema= new mongoose.Schema({
    username:String,
    password:String,
    email:String,
    img_url:{
        type:String,
        default:"http://s1.bdstatic.com/r/www/cache/xmas2012/images/car.png"
    },
    level:Number
});

module.exports= mongoose.model('User', userSchema);