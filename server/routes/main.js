const express=require('express');
const router=express.Router();
let Article = require('../dbModels/Article');

/**
 * 判断是ajax请求还是  页面直接刷新的请求 的中间件
 * 如果是ajax请求则返回片段
 * 如果是直接刷新的请求 则返回完整页面
 * 这个中间件只负责判断，不负责渲染
 * x-requested-with:XMLHttpRequest
 */
router.use((req, res, next) => {
    console.log('(nodejs API)是否是ajax请求：',req.header('x-requested-with')==='XMLHttpRequest');
    console.log('(express API)是否是ajax请求：',req.xhr);
    //req.app.locals.isAjax=req.xhr;//这个不能用，会出问题，因为它是全局的，整个服务器共享的
    res.locals.isAjax = req.xhr;//一个请求对应的一个响应
    next();
})


/**
 * 首页
 */
router.get('/', (req, res, next) => {
    //获取下前端传给后端的分页数据
    
    let page = Number(req.query.page)||1; //第几页
    let limit = 9 ; //每页固定显示的数据条数

    let offset = (page-1)*limit;
    /*
    //查询数据总共有多少条
    Article.count().then(count => {
        responseMesg.data.total = count;
    });
    */

    Article.find().sort({
        '_id':-1
    }).skip(offset).limit(limit).then(articles => {
        articles = articles.map((item,index)=>{
            //获取body中的第一张图片地址作为封面
            let result = item.body.match(/<img [^>]*src=['"]([^'"]+)[^>]*>/);
            //console.log(result);
            if(result){
                item.cover = result[1];
            }else{
                //如果匹配不到，给一个默认的封面
                item.cover = 'http://o0xihan9v.qnssl.com/wp-content/themes/Always/images/thumb.jpg';
            }
            
            //过滤html并且截取前76个字符
            item.body = item.body.replace(/<[^>]+>/g,'').substring(0,77)+'...';
            var end = new Date().getTime();
            var duration=MillisecondToDate(end-item.time.getTime(),item.time);
            item.duration=duration;
            console.log("发布时间：",item.time);
            return  item;
        });
       
        res.render('index',{
            //articles:articles
            articles:articles,
            user: req.session.user
        });
    })
   
    function MillisecondToDate(msd,date) {
		var time = parseFloat(msd) /1000;
		if (null!= time &&""!= time) {
            //console.log('时间换算中：',time);
			if (time >60&& time <60*60) {
                console.log('进了1');
				time = parseInt(time /60.0) +"分钟前";
			}else if (time >=60*60&& time <60*60*9) {
                console.log('进了2');
				time = parseInt(time /3600.0) +"小时前";
			}else if (time >=60*60*9&& time <60*60*36) {
                console.log('进了3');
                time = "昨天";
				//time = parseInt(time /(3600.0*24)) +"天"+parseInt((parseFloat(time /(3600.0*24)) -
				//parseInt(time /(3600.0*24))) *24) +"小时"+ parseInt((parseFloat(time /3600.0) -parseInt(time /3600.0)) *60) +"分钟"+parseInt((parseFloat((parseFloat(time /3600.0) - parseInt(time /3600.0)) *60) -parseInt((parseFloat(time /3600.0) - parseInt(time /3600.0)) *60)) *60) +"秒";
			}else if (time >=60*60*36&& time <60*60*60) {
                console.log('进了4');
                time = "2天前";
				//time = parseInt(time /(3600.0*24)) +"天"+parseInt((parseFloat(time /(3600.0*24)) -
				//parseInt(time /(3600.0*24))) *24) +"小时"+ parseInt((parseFloat(time /3600.0) -parseInt(time /3600.0)) *60) +"分钟"+parseInt((parseFloat((parseFloat(time /3600.0) - parseInt(time /3600.0)) *60) -parseInt((parseFloat(time /3600.0) - parseInt(time /3600.0)) *60)) *60) +"秒";
			}else if (time >=60*60*60&& time <60*60*84) {
                console.log('进了5');
                time = "3天前";
				//time = parseInt(time /(3600.0*24)) +"天"+parseInt((parseFloat(time /(3600.0*24)) -
				//parseInt(time /(3600.0*24))) *24) +"小时"+ parseInt((parseFloat(time /3600.0) -parseInt(time /3600.0)) *60) +"分钟"+parseInt((parseFloat((parseFloat(time /3600.0) - parseInt(time /3600.0)) *60) -parseInt((parseFloat(time /3600.0) - parseInt(time /3600.0)) *60)) *60) +"秒";
			}else if (time >=60*60*84) {
                console.log('进了6');
                console.log(date);
                var y = date.getFullYear();  
                var m = date.getMonth()+1;  
                var d = date.getDate();
                console.log(y,m,d);
				time = y+'年'+m+'月'+d+'日';
			}else {
                console.log('进了7');
				time = "刚刚";
			}
		}else{
			time = "刚刚";
		}
		return time;

	}

});









/**
 * 文章详情
 */
router.get('/article/detail/:id', (req, res, next) => {
    let id= req.params.id;
    //成功一定会进入then函数
    //失败一定会进入catch函数
    //promise写法
    Article.findById(id).then(article=>{
        res.render('article-details',{
            article
        });  
    }).catch(error=>{
        res.render('404');
    });
   
});

router.get('/index',(req,res,next)=>{
    res.render('index');
});

/**
 * 跳转到登陆界面
 */
router.get('/login',(req,res,next)=>{
    /*
    var request = require('request');
    request('http://cn.bing.com/', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(body);
        }
    })
    */
    res.render('login');
});



/**
 * 首页文章列表
 */
router.get('/article/list',(req,res,next)=>{
    //获取下前端传给后端的分页数据
    
    let page = Number(req.query.page)||1; //第几页
    let limit = 9 ; //每页固定显示的数据条数

    let offset = (page-1)*limit;

    //          0      9      ==>第1页  page
    //          9     9      ==>第2页  
    //          18     9      ==>第3页
    //  offset/limit  +1  = page
    // offset= （ page-1）* limit 

    //查询数据总共有多少条
    Article.count().then(count => {
        responseMesg.data.total = count;
    });
    //skip  limit  跳过前面skip条数据，然后往后取limit条数据
    //sort({ 要排序的字段:+1||-1 })   +1代表升序  -1代表降序
    Article.find().sort({
        '_id':-1
    }).skip(offset).limit(limit).then(articles => {
        articles = articles.map((item,index)=>{
            //获取body中的第一张图片地址作为封面
            let result = item.body.match(/<img [^>]*src=['"]([^'"]+)[^>]*>/);
            //console.log(result);
            if(result){
                item.cover = result[1];
            }else{
                //如果匹配不到，给一个默认的封面
                item.cover = 'http://o0xihan9v.qnssl.com/wp-content/themes/Always/images/thumb.jpg';
            }
            
            //过滤html并且截取前76个字符
            item.body = item.body.replace(/<[^>]+>/g,'').substring(0,77)+'...';
            //var datenow=new Date().getTime();
            
            return  item;
        });
       
        
        
        res.json(articles);
    });

    //let date=new Date();
    //console.log("时间为：",Article.time.toISOString());
    //console.log("新闻封面：",Article.cover);
    console.log("测试");
});


module.exports=router;