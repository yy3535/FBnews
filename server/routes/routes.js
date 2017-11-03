
module.exports=app=>{

    //校验登陆的中间件
    //校验是否登陆的中间件
    //在开发模式的时候 让权限校验失效
    //1.如何判断是什么模式
    console.log('是否是开发模式process.env.NODE_ENV：',process.env.NODE_ENV==='dev');
    console.log('是否是开发模式app.locals.isDev：',app.locals.isDev);
    
    //2.如何让权限校验失效
   /* if(!app.locals.isDev){
       
    }*/
    app.use(require('./auth'));
    


    //引入路由
    app.use('/api', require('./api'));
    app.use('/admin', require('./admin'));
    app.use('/', require('./main'));

}

