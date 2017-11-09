const mongoose = require('mongoose');
//创建一张集合，schema
let userSchema= new mongoose.Schema({
    username:String,
    password:String,
    email:String,
    level:Number
});

module.exports= mongoose.model('User', userSchema);