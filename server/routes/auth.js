/**
 * 处理登陆鉴权的模块
 */

 module.exports=(req,resp,next)=>{
    //如果是开发模式，则自己伪造一个user对象放到session中，以此来跳过登陆鉴权
    //req.app 可以获取到 app.js里面的express()产生的实例（对象）
    // if(req.app.locals.isDev){
    //     req.session.user = {
    //         _id:'599ed834e0510be9d781cec3',
    //         username: '张三'
    //     }
    // }
    console.log('所有的请求都被我拦截掉',req.url);
    //有些请求是不应该被拦截的  登陆注册不能被拦截
    //  /admin/index
    //如果请求路径 以 /admin开头，就要拦截对其进行权限校验
    if(req.url.startsWith('/admin')){
        if(req.session.user){
            //存在session,放行
            console.log('有权限，允许放行');
            next();
        }else{
            console.log('没有登陆，不允许访问，先跳转到登陆')
            //重定向跳转到登陆页面
            resp.redirect('/login');
        
        }
    }else{
        next();
    }
}
