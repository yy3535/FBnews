const express=require('express');
var request = require('request');
var cheerio = require('cheerio');
const router=express.Router();
let Article = require('../dbModels/Article');
let Comment = require('../dbModels/Comment');
let User = require('../dbModels/User');
//后端响应给前端的数据格式
let responseMesg;
router.use((req, resp, next) => {
    //初始化一下数据格式
    responseMesg = {
        success: false,
        message: '',
        data: {
            total: 0,
            rows: []
        }
    };
    next();
});
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
 * 获取爬虫文章
 */
router.post('/getCrawlerArticles',(req,res,next)=>{
    // 创建一个空数组，用来装载我们的文章对象
    var articlesData = [];
    for(var j=0;j<1;j++){
        var rand = Math.random()*10000000000000000;   
        var articleListUrl='http://www.yidianzixun.com/home/q/news_list_for_channel?channel_id=best&cstart='+10*j+'&cend='+10*(j+1)+'&infinite=true&refresh=1&__from__=pc&multi=5&appid=yidian&_='+rand;
        //console.log(articleListUrl);
        request(articleListUrl, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                $ = cheerio.load(body);
                //console.log("进入一点资讯爬虫");
                //console.log('获取文章列表：',body);
                
                
                var jsonArticlesData=JSON.parse(body).result;
    
                //console.log("共多少条数据：",JSON.parse(body).result.length);
    
                for(var i=0;i<jsonArticlesData.length;i++){
                    var url=jsonArticlesData[i].url;
                    //console.log(url);
                    request(url,function(error,response,body){
                        if (!error && response.statusCode == 200) {
                            $ = cheerio.load(body);
                            //console.log(body);
                            var title=$('.left-wrapper h2').text()==""?"无法获取标题":$('.left-wrapper h2').text();
                            Article.findOne({'title':title},article=>{
                                if(article||title=="无法获取标题"){
                                    console.log(title);
                                }else{
                                    var content=$('.left-wrapper .content-bd').html()==null?"无法获取内容":$('.left-wrapper .content-bd').html();
                                    // 创建文章对象，JS 的对象确实跟 json 的很像呀
                                    var articleData = {
                                        title : title, 
                                        body  : content
                                    };
                                    articlesData.push(articleData);
                                }
                            });
                        }
                        if(articlesData.length==10){
                            //console.log('爬取的文章列表：',articlesData);

                            /**
                             * 添加文章
                             */
                            // console.log(parms);
                            // if (!parms.title || !parms.body) {
                            //     responseMesg.message = '标题或者内容不能为空！';
                            //     res.json(responseMesg);
                            //     return;
                            // }
                            // new Article({
                            //     title: parms.title,
                            //     body: parms.body
                            // }).save().then(article => {
                            //     responseMesg.success = true;
                            //     responseMesg.message = '保存成功！';
                            //     res.json(responseMesg);
                            // });

                            Article.insertMany(articlesData, function(err, docs){
                                    if(err) console.log(err);
                                    //console.log('保存成功：' + docs);
                            });

                        }
                    });
                }
                
            }
        });
    }
});


/**
 * 首页
 */
router.get('/', (req, res, next) => {
    //获取下前端传给后端的分页数据
    
    let page = Number(req.query.page)||1; //第几页
    let limit = 20 ; //每页固定显示的数据条数

    let offset = (page-1)*limit;

    Article.find().sort({
        '_id':-1
    }).skip(offset).limit(limit).then(articles => {
        //console.log(articles);
        articles = articles.map((item,index)=>{
            //获取body中的第一张图片地址作为封面
            let result = item.body.match(/<img [^>]*src=['"]([^'"]+)[^>]*>/);
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
            return  item;
        });

        res.render('index',{
            //articles:articles
            articles:articles,
            user: req.session.user
        });

    })
   
});

/**
 * 获取分页数据
 */
router.post('/getPageArticles',(req,res,next)=>{
    //获取下前端传给后端的分页数据
    let page = Number(req.body.page)||1; //第几页
    let limit = 5 ; //每页固定显示的数据条数

    let offset = (page-1)*limit;

    Article.find().sort({
        '_id':-1
    }).skip(offset).limit(limit).then(articles => {
        //console.log(articles);
        if(articles){
            articles = articles.map((item,index)=>{
                //获取body中的第一张图片地址作为封面
                let result = item.body.match(/<img [^>]*src=['"]([^'"]+)[^>]*>/);
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
                return  item;
            });
        }
        res.json(articles);

    })
})

/**
 * 个人中心
 */
router.get('/profile',(req,res,next)=>{
    res.render('profile',{
        user: req.session.user
    });
});





/**
 * 文章详情
 */
router.get('/article/detail/:id', (req, res, next) => {
    let id= req.params.id;
    //成功一定会进入then函数
    //失败一定会进入catch函数
    //promise写法
    console.log("进入文章详情后台接口");
    
    
    Article.findById(id).then(article=>{
        console.log("查到的文章：",article);
        // Comment.find({"_id":{"$in":article["comments_ids"]}}).then(comments=>{
        //     var comments=comments;
        // });
        //Model.find({“age”:{ “$in”:[20,21,22.‘haha’]} } );
        // article.comments.map((item,index)=>{
        //     comment.findById(item).then(comment=>{
        //         console.log('查询出来的评论：',comment);
                
        //     })
            
        //     console.log();
        //     User.findById(item.userid).then(user=>{
        //         console.log("查询出来的用户：",user);
        //         item.username=user.username;
        //     })

        //     var end = new Date().getTime();
        //     item.duration=MillisecondToDate(end-item.time.getTime(),item.time);
        // })
        //console.log(comments);
        res.render('article-details',{
            article:article,
            //comments:comments,
            user:req.session.user
        });
    }).catch(error=>{
        res.render('404');
    });
   
});

router.get('/index',(req,res,next)=>{
    res.render('index');
});
/**
 * 发布评论
 */
router.post('/article/detail/saveComment',(req,res,next)=>{
    let parms= req.body;
    console.log(parms);
    new Comment({
        userid: parms.userId,
        body: parms.body
    }).save().then(comment => {
        responseMesg.success = true;
        responseMesg.message = '保存成功！';
        res.json(responseMesg);
        Article.update({'_id':parms.articleId},{$addToSet:{
            'comments_ids':comment._id
        }}).then(comments=>{
            console.log("插入评论完成");
            if(comments){
                console.log("评论：",comments);
                responseMesg.success=true;
                responseMesg.message='发表成功';
                
            }else{
                responseMesg.message='发表失败';
            }
            res.json(responseMesg);
        });
    });
    
    
})

/**
 * 评论回复提交
 */
router.post('/article/detail/saveReply',(req,res,next)=>{
    let parms= req.body;
    console.log(parms);
    Article.update({'_id':parms.docid,'comments.comments_id':parms.commentid},{$addToSet:{'comments.$.replys':{
        'from':parms.from,
        'content':parms.content
    }}}).then(replay=>{
        console.log("插入回复完成");
        if(replay){
            console.log("回复：",replay);
            responseMesg.success=true;
            responseMesg.message='发表成功';
            
        }else{
            responseMesg.message='发表失败';
        }
        res.json(responseMesg);
    });
    
})

// this.insertComment=function(from,to,content,time,theme_name,post_id){
//     return themeModel.update({theme_name:theme_name,'posts.post_id':post_id},{$push:{'posts.$.comments':{
//         from:from,
//         to:to,
//         content:content,
//         time:time
//     }}});
// };





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


/**
 * 获取用户信息接口
 */
router.get('/getuserinfo',(req,res,next)=>{
    if(req.session.user!=null){
        var ret={     
            "is_login": 1,
            "user":  {
                "img_url": "http://s1.bdstatic.com/r/www/cache/xmas2012/images/car.png",
                "nickname": req.session.user.username,
                "profile_url": "http://www.baidu.com",
                "user_id": req.session.user._id,
                "sign":"werdfasdfasdf"
                }
            };        
    }else{
        var ret={     
            "is_login": 0
        };
    }
    res.jsonp(ret);
})


/**
 * 退出
 */
router.get('/logout',(req, res, next) => {
    req.session.user=null;
    if(req.session.user==null){
        var ret={     
            "code": 1,
            "reload_page": 0
            };
    }else{
        req.session.user=null;
        res.redirect(req.headers['referer']);
        var ret={     
            "code": 1,
            "reload_page": 1
            };
    }
});
// router.get('/logout',(req, res, next) => {
//     req.session.user=null;
    
    
    
//     res.redirect(req.headers['referer']);
// });

/**
 * 工具类
 * @param {毫秒数} msd 
 * @param {日期对象} date 
 */
function MillisecondToDate(msd,date) {
    var time = parseFloat(msd) /1000;
    if (null!= time &&""!= time) {
        if (time >60&& time <60*60) {
            time = parseInt(time /60.0) +"分钟前";
        }else if (time >=60*60&& time <60*60*9) {
            time = parseInt(time /3600.0) +"小时前";
        }else if (time >=60*60*9&& time <60*60*36) {
            time = "昨天";
            //time = parseInt(time /(3600.0*24)) +"天"+parseInt((parseFloat(time /(3600.0*24)) -
            //parseInt(time /(3600.0*24))) *24) +"小时"+ parseInt((parseFloat(time /3600.0) -parseInt(time /3600.0)) *60) +"分钟"+parseInt((parseFloat((parseFloat(time /3600.0) - parseInt(time /3600.0)) *60) -parseInt((parseFloat(time /3600.0) - parseInt(time /3600.0)) *60)) *60) +"秒";
        }else if (time >=60*60*36&& time <60*60*60) {
            time = "2天前";
            //time = parseInt(time /(3600.0*24)) +"天"+parseInt((parseFloat(time /(3600.0*24)) -
            //parseInt(time /(3600.0*24))) *24) +"小时"+ parseInt((parseFloat(time /3600.0) -parseInt(time /3600.0)) *60) +"分钟"+parseInt((parseFloat((parseFloat(time /3600.0) - parseInt(time /3600.0)) *60) -parseInt((parseFloat(time /3600.0) - parseInt(time /3600.0)) *60)) *60) +"秒";
        }else if (time >=60*60*60&& time <60*60*84) {
            time = "3天前";
            //time = parseInt(time /(3600.0*24)) +"天"+parseInt((parseFloat(time /(3600.0*24)) -
            //parseInt(time /(3600.0*24))) *24) +"小时"+ parseInt((parseFloat(time /3600.0) -parseInt(time /3600.0)) *60) +"分钟"+parseInt((parseFloat((parseFloat(time /3600.0) - parseInt(time /3600.0)) *60) -parseInt((parseFloat(time /3600.0) - parseInt(time /3600.0)) *60)) *60) +"秒";
        }else if (time >=60*60*84) {
            var y = date.getFullYear();  
            var m = date.getMonth()+1;  
            var d = date.getDate();
            time = y+'年'+m+'月'+d+'日';
        }else {
            time = "刚刚";
        }
    }else{
        time = "刚刚";
    }
    return time;

}

module.exports=router;