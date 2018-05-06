const express=require('express');
const router=express.Router();


//引入操作数据库的模型对象
let User = require('../dbModels/User');

//后端响应给前端的数据格式
let responseMesg;

//在进入下面的路由之前，先调用中间件处理下
//该中间件在api。js里，所以只拦截api。js里面的路由
router.use((req, resp, next) => {
    console.log('中间件进来了');
    //初始化一下数据格式
    responseMesg = {
        success: false,
        message: ''
    };
    //放行;注意：如果不放行的话，请求就会被堵塞在中间件，进入不到下面的路由
    next();
});

/**
 * 校验用户民和密码
 */
router.post('/user/check',(request,response,next)=>{
    let parms = request.body;
    //首先判断前端传的参数是否正确(后端必须做参数的正确性校验，考虑最坏的情况)
    if (!parms.username || !parms.password) {
        //返回给前端一个错误消息
        responseMesg.message = '用户名或密码不能为空！'
        response.json(responseMesg);
        return;
    }

    //Promise写法   实现链式写法
    User.findOne({
        username: parms.username,
        password: parms.password
    })
    .then((user) => {
        console.log('查询结果');
        if (user) {
            responseMesg.success = true;
            responseMesg.message = '登陆成功';
            //登陆成功后往session里面存东西
            //把数据库查出来的这个user 作为标识存到session的user属性上
            request.session.user=user;
            response.json(responseMesg);
        } else {
            responseMesg.message = '用户名或者密码不正确！'
            response.json(responseMesg);

        }
    })
});

/**
 * 注册
 */
router.post('/user/registe',(request,response,next)=>{
    let parms = request.body;
    //首先判断前端传的参数是否正确(后端必须做参数的正确性校验，考虑最坏的情况)
    if (!parms.username || !parms.password || !parms.email) {
        //返回给前端一个错误消息
        responseMesg.message = '用户名、密码或邮箱不能为空！'
        response.json(responseMesg);
        return;
    }

    User.findOne({
        username: parms.username
    })
    .then((user) => {
        if (user) {
            responseMesg.message = '用户名已存在！';
            response.json(responseMesg);
            return;
        } else {
            new User({
                username:parms.username,
                password:parms.password,
                email:parms.email,
                level:1
            }).save().then(user=>{
                responseMesg.success = true;
                responseMesg.message = '注册成功';
                request.session.user=user;
                response.json(responseMesg);
            }).catch(error=>{
                console.log('报错了',error);
            })

        }
    })
    // new User({
    //     username:"yy",
    //     password:'c1096d2671f98c869e72b0c4b35c7894',//yinyiyy01
    //     email:"137186247@qq.com"
    // }).save().then(user=>{
    //     response.json(user);
    // }).catch(error=>{
    //     console.log('报错了',error);
    // })
});


/**
 * 查询用户列表
 */
router.get('/user/list', (req, res, next) => {
    Article.find().then(users => {
        res.json(users);
    });
});



module.exports=router;