const express = require('express');
//引入模板
const swig = require('swig');
//处理前端的POST请求
const bodyParser = require('body-parser');
//引入连接数据库的插件（驱动）
const mongoose = require('mongoose');
//引入session模块
const session = require('express-session');
const app = express();


//session的中间件,加了它以后就可以在路由里面用req.session 获取到session
app.use(session({
    secret: 'alibaba', //用来对session进行加密的密钥，有了这个密钥，才能解密
    resave: false, //是否重新保存会话
    saveUninitialized: true //自动初始化会话
}))

//处理前端的POST请求的配置
//处理前端传给后端的表单格式数据（表单提交、ajax提交）  fromdata
app.use(bodyParser.urlencoded({
    extended: false
}))
//处理前端以json格式传给后端的数据 application/json 
app.use(bodyParser.json());


const ueditor = require("ueditor");
const path = require('path');
//将public/ueditor 目录静态化
app.use('/ueditor', express.static(__dirname + '/public/ueditor'));
app.use("/ueditor/ue", ueditor(path.join(__dirname, 'public'), function (req, res, next) {
    //客户端上传文件设置
    var imgDir = '/ueditor/upload/img'
     var ActionType = req.query.action;
    if (ActionType === 'uploadimage' || ActionType === 'uploadfile' || ActionType === 'uploadvideo') {
        var file_url = imgDir;//默认图片上传地址
        /*其他上传格式的地址*/
        if (ActionType === 'uploadfile') {
            file_url = '/ueditor/upload/file'; //附件
        }
        if (ActionType === 'uploadvideo') {
            file_url = '/ueditor/upload/video'; //视频
        }
        res.ue_up(file_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
        res.setHeader('Content-Type', 'text/html');
    }
    //  客户端发起图片列表请求
    else if (req.query.action === 'listimage') {
        var dir_url = imgDir;
        res.ue_list(dir_url); // 客户端会列出 dir_url 目录下的所有图片
    }
    // 客户端发起其它请求
    else {
        // console.log('config.json')
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/ueditor/nodejs/config.json');
    }
}));

//模板配置--------------------------------
app.engine('html', swig.renderFile);
app.set('views', './server/views');
app.set('view engine', 'html');
//模板配置end-------------------------------

//取出设置的环境变量
console.log('取出的变量值', process.env.NODE_ENV);
//是否是开发模式
const isDev = process.env.NODE_ENV === 'dev';
//将是否是开发模式存放到locals全局变量中，方便在其他任何地方获取
app.locals.isDev = isDev;

if (isDev) {
    //模板不缓存
    swig.setDefaults({
        cache: false
    });
    //--------------node中调用webpack实现热刷新的中间件-----------------------------------------------
    //3.在这里调用webpack的配置
    const webpack = require('webpack');
    const webpackConfig = require('./webpack.config.js');
    const compiler = webpack(webpackConfig);

    app.use(require('webpack-dev-middleware')(compiler, {
        noInfo: true,
        stats: {
            colors: true
        },
        publicPath: webpackConfig.output.publicPath
    }));

    app.use(require('webpack-hot-middleware')(compiler));
    //--------------node中调用webpack实现热刷新的中间件end-----------------------------------------------


    //------------------路由-------------------------------------------

    //引入路由
    require('./server/routes/routes')(app);

    //-----------------路由end--------------------------------------------

    //引入browser-sync 模块，实现修改前端代码浏览器自动刷新
    const browserSync = require('browser-sync').create();
    //实现服务器重启以后浏览器能自动刷新
    const reload = require('reload');
    const http = require('http');
    const server = http.createServer(app);
    reload(app); //通知浏览器刷新 
    server.listen(8080, () => {


        //告诉 browserSync  我们监听哪个目录（配置）
        browserSync.init({
            ui: false,
            open: false,
            online: false, //离线工作模式，可以大大提高启动速度
            notify: false, //不显示在浏览器中的任何通知
            proxy: 'localhost:8080', //要代理的服务器地址
            files: './server/views/**', //监听被修改的代码
            port: 3000 //服务器启动的端口
        }, () => console.log('开发模式，代理服务器启动成功'));


    });

} else {

    //配置静态资源目录(可配置多个)  配置了上面的中间件，这行代码在开发时可以注释掉了
    //因为上面的热加载把编译后的文件放内存了，不放public的文件磁盘上了
    app.use('/public', express.static(__dirname + '/public'));


    //引入路由
    require('./server/routes/routes')(app);

    app.listen(8080, () => {
        console.log('web应用启动成功');
    });
}


mongoose.connect('mongodb://localhost:27017/Blog2', {
        useMongoClient: true
    })
    .on('open', (db) => {
        console.log('数据库连接成功');
    })
    .on('error', (error) => {
        console.log('数据库连接失败');
    })