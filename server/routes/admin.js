const express = require('express');
const router = express.Router();
var request = require('request');
var superagent = require('superagent');
var cheerio = require('cheerio');
var iconv=require('iconv-lite');
let Article = require('../dbModels/Article');
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
 * 跳转到登陆后的首页
 */
router.get('/index', (req, res, next) => {
    res.render('admin/article-list', {
        user: req.session.user
    });
});

/**
 * 获取今日头条爬虫文章
 */
router.post('/article/getCrawlerArticles',(req,res,next)=>{
    var baseUrl="https://www.toutiao.com";
    //热点
    var redianUrl='https://www.toutiao.com/api/pc/feed/?category=news_hot&utm_source=toutiao&widen=1&max_behot_time=0&max_behot_time_tmp=0&tadrequire=true&as=A1D50A5EAB2BFE3&cp=5AEBBB6F8E332E1&_signature=Turn1wAAFALxnBYxAR98K07q58';
    //娱乐
    var yuleUrl='https://www.toutiao.com/api/pc/feed/?category=news_entertainment&utm_source=toutiao&widen=1&max_behot_time=2245928322&max_behot_time_tmp=1525347649&tadrequire=true&as=A1C56ABEBBD0227&cp=5AEB9062E2278E1&_signature=DNkFZwAAVjezr.SBfxYXtAzZBX';

    //getToutiaoArticles(redianUrl,'热点');
    getToutiaoArticles(yuleUrl,'娱乐');

    function getToutiaoArticles(url,group){
        request.get(url,function (error, response, body) {
            if (!error && response.statusCode == 200) {
                $ = cheerio.load(body);            
                var jsonArticlesData=JSON.parse(body).data;
                console.log("获取七条数据：");
                jsonArticlesData.forEach(function(ele,index){
                    var url=baseUrl+ele.source_url;
                    console.log(ele.title);
                    request(url,function(error,response,body){
                        console.log(url,error);
                        if (!error) {
                            $ = cheerio.load(body);
                            var title=$('h1').text()==""?"无法获取标题":$('h1').text();
                            var content=$('.article-content').html()==null?"无法获取内容":$('.article-content').html();
                            Article.findOne({'title':title},article=>{
                                if(article){
                                    console.log("重复文章：",article);
                                }else if(title=="无法获取标题"||content=="无法获取内容"){
                                    console.log("文章不可获取");
                                }else{
                                    // 创建文章对象，JS 的对象确实跟 json 的很像呀
                                    var article = new Article({
                                        title : title,
                                        body: content,
                                        author:'今日头条',
                                        group:group
                                    });
                                    article.save(function (err, res) {
                                        if (err) {
                                            console.log("获取失败");
                                        }
                                        else {
                                            console.log("获取成功");
                                        }
                                    });
    
                                }
                            });
                        
                        }
                    });
                })
                
            }
        });
    }
    
    
});

/**
 * 获取凤凰网爬虫文章
 */
router.post('/article/getFenghuangArticles',(req,res,next)=>{
    var todayStr=new Date().toISOString().substr(0,10).replace(/-/g,"");
    //社会
    var societyUrl="http://news.ifeng.com/listpage/7837/"+todayStr+"/1/rtlist.shtml";
    
    getFenghuangArticles(societyUrl,'社会');

    function getFenghuangArticles(url,group){
        request.get(url,function (error, response, body) {
            if (!error && response.statusCode == 200) {
                $ = cheerio.load(body);            
                var urlList=[];
                $(".newsList a").each(function(index,ele){
                    urlList.push($(ele).attr('href'));
                })
                urlList.forEach(function(url,index){
                    superagent(url)
                    .end(function(error,response){
                        if (!error) {
                            $ = cheerio.load(response.text, {decodeEntities: false});
                            
                            var title=$('#artical_topic').text()==""?"无法获取标题":$('#artical_topic').text();
                            var content=$('#artical_real').html()==null?"无法获取内容":$('#artical_real').html();
                            
                            Article.findOne({'title':title},article=>{
                                if(article){
                                    console.log("重复文章：",article);
                                }else if(title=="无法获取标题"||content=="无法获取内容"){
                                    console.log("文章不可获取");
                                }else{
                                    // 创建文章对象，JS 的对象确实跟 json 的很像呀
                                    var article = new Article({
                                        title : title,
                                        body: content,
                                        author:'凤凰网',
                                        group:group
                                    });
                                    article.save(function (err, res) {
                                        if (err) {
                                            console.log("获取失败");
                                        }
                                        else {
                                            console.log("获取成功");
                                        }
                                    });
    
                                }
                            });
                        
                        }
                    })
                })
                
            }
        });
    }
});

/**
 * 获取网易爬虫文章
 */
router.post('/article/getWangyiArticles',(req,res,next)=>{
    //社会
    var societyUrl="http://temp.163.com/special/00804KVA/cm_shehui.js?callback=data_callback";
    console.log("进入网易新闻接口");
    getWangyiArticles(societyUrl,'社会');

    function getWangyiArticles(url,group){
        request.get(url,function (error, response, body) {
            if (!error && response.statusCode == 200) {
                $ = cheerio.load(body); 

                var data=JSON.parse(body.substring(body.indexOf('(')+1,body.lastIndexOf(')')));
                data.forEach(function(item,index){
                    var headers = {  
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36'
                    }
                    function request1 (url, callback) {  
                        var options = {
                            url: url,
                            encoding: null,
                            headers: headers
                        }
                        request(options, callback)
                    }

                    request1(item.tlink,function(error,response,body){
                        if (!error) {
                            var html=iconv.decode(body,'gb2312');
                            $ = cheerio.load(html, {decodeEntities: false});
                            var title=$('h1').text()==""?"无法获取标题":$('h1').text();
                            var content=$('#endText').html()==null?"无法获取内容":$('#endText').html();
                            
                            Article.findOne({'title':title},article=>{
                                if(article){
                                    console.log("重复文章：",article);
                                }else if(title=="无法获取标题"||content=="无法获取内容"){
                                    console.log("文章不可获取");
                                }else{
                                    // 创建文章对象，JS 的对象确实跟 json 的很像呀
                                    var article = new Article({
                                        title : title,
                                        body: content,
                                        author:'网易新闻',
                                        group:group
                                    });
                                    article.save(function (err, res) {
                                        if (err) {
                                            console.log("获取失败");
                                        }
                                        else {
                                            console.log("获取成功");
                                        }
                                    });
    
                                }
                            });
                        
                        }
                    })
                })
                
            }
        });
    }
});

/**
 * 获取新浪爬虫文章
 */
router.post('/article/getXinlangArticles',(req,res,next)=>{
    //娱乐
    var yuleUrl="http://ent.sina.com.cn/interface/tianyi/feedData_news.js";
    console.log("进入新浪接口");
    getXinlangArticles(yuleUrl,'娱乐');

    function getXinlangArticles(url,group){
        request.get(url,function (error, response, body) {
            if (!error && response.statusCode == 200) {
                $ = cheerio.load(body); 
                
                var data=JSON.parse(body.substring(body.indexOf('=')+1,body.length)).data;
                data.forEach(function(item,index){
                    var headers = {  
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36'
                    }
                    function request1 (url, callback) {  
                        var options = {
                            url: url,
                            encoding: null,
                            headers: headers
                        }
                        request(options, callback)
                    }

                    request1(item.url,function(error,response,body){
                        if (!error) {
                            $ = cheerio.load(body, {decodeEntities: false});
                            var title=$('#artibodyTitle').text()==""?"无法获取标题":$('#artibodyTitle').text();
                            var content=$('#artibody').html()==null?"无法获取内容":$('#artibody').html();
                            Article.findOne({'title':title},article=>{
                                if(article){
                                    console.log("重复文章：",article);
                                }else if(title=="无法获取标题"||content=="无法获取内容"){
                                    console.log("文章不可获取");
                                }else{
                                    // 创建文章对象，JS 的对象确实跟 json 的很像呀
                                    var article = new Article({
                                        title : title,
                                        body: content,
                                        author:'新浪网',
                                        group:group
                                    });
                                    article.save(function (err, res) {
                                        if (err) {
                                            console.log("获取失败");
                                        }
                                        else {
                                            console.log("获取成功");
                                        }
                                    });
                                }
                            });
                        
                        }
                    })
                })
            }
        });
    }
});

/**
 * 获取新华网爬虫娱乐文章
 */
router.post('/article/getXhwYuleArticles',(req,res,next)=>{
    // 创建一个空数组，用来装载我们的文章对象
    var articlesData = [];
    var isAdded=false;
    for(var j=1;j<10;j++){
        var rand = Math.random()*100000000000000;   
        //var articleListUrl='http://qc.wa.news.cn/nodeart/list?nid=116713&pgnum=2&cnt=10&tp=1&orderby=1?callback=jQuery17104505670552238503_1525269532607&_=1525269656048';
        var articleListUrl='http://qc.wa.news.cn/nodeart/list?nid=116713&pgnum='+j+'&cnt=10&tp=1&orderby=1?callback=jQuery17104505670552238503_1525269532607&_='+rand;
        request.get(articleListUrl, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                console.log(typeof body);
                $ = cheerio.load(body); 
                body=body.replace("jQuery17104505670552238503_1525269532607(","");
                body.substring(0,body.length-1);      
                // var jsonArticlesData=body;
                //console.log(JSON.parse(body).jQuery17104505670552238503_1525269532606);
                console.log(JSON.parse(body));
                // var articleList=[];
                // for(var i=0;i<jsonArticlesData.length;i++){
                //     var url=jsonArticlesData[i].url;
                //     request(url,function(error,response,body){
                //         if (!error && response.statusCode == 200) {
                //             $ = cheerio.load(body);
                //             var title=$('.left-wrapper h2').text()==""?"无法获取标题":$('.left-wrapper h2').text();
                //             var content=$('.left-wrapper>.content-bd').html()==null?"无法获取内容":$('.left-wrapper .content-bd').html();
                //             Article.findOne({'title':title},article=>{
                //                 if(isAdded&&article){
                //                 }else if(title=="无法获取标题"||content=="无法获取内容"){
                //                 }else{
                //                     // 创建文章对象，JS 的对象确实跟 json 的很像呀
                //                     var article = new Article({
                //                         title : title,
                //                         body: content
                //                     });
                                    
                //                     article.save(function (err, res) {
                //                         if (err) {
                //                             console.log("获取失败");
                //                         }
                //                         else {
                //                             console.log("获取成功");
                //                         }
                //                     });

                //                 }
                //             });
                //         }
                //     });
                // }
                
            }
        });
    }
});

/**
 * 获取中国青年网爬虫文章
 */
router.post('/article/getQnwArticles',(req,res,next)=>{
    // 创建一个空数组，用来装载我们的文章对象
    var articlesData = [];
    var isAdded=false;
    var articleListUrl='http://t.m.youth.cn/jsonp/myouth.php?channel=qwtx&callback=post_data';
    request.get(articleListUrl, function (error, res, body) {
        if (!error && res.statusCode == 200) {
            //console.log(body);
            $ = cheerio.load(body); 
             
            // var jsonArticlesData=body;
            console.log(JSON.parse(body));
            console.log(JSON.parse(body));
            // var articleList=[];
            // for(var i=0;i<jsonArticlesData.length;i++){
            //     var url=jsonArticlesData[i].url;
            //     request(url,function(error,response,body){
            //         if (!error && response.statusCode == 200) {
            //             $ = cheerio.load(body);
            //             var title=$('.left-wrapper h2').text()==""?"无法获取标题":$('.left-wrapper h2').text();
            //             var content=$('.left-wrapper>.content-bd').html()==null?"无法获取内容":$('.left-wrapper .content-bd').html();
            //             Article.findOne({'title':title},article=>{
            //                 if(isAdded&&article){
            //                 }else if(title=="无法获取标题"||content=="无法获取内容"){
            //                 }else{
            //                     // 创建文章对象，JS 的对象确实跟 json 的很像呀
            //                     var article = new Article({
            //                         title : title,
            //                         body: content
            //                     });
                                
            //                     article.save(function (err, res) {
            //                         if (err) {
            //                             console.log("获取失败");
            //                         }
            //                         else {
            //                             console.log("获取成功");
            //                         }
            //                     });

            //                 }
            //             });
            //         }
            //     });
            // }
            
        }
    });
});

/**
 * 查询列表（一次性查出所有数据）
 */
router.get('/article/list', (req, res, next) => {
    Article.find().then(articles => {
        res.json(articles);
    });
});

/**
 * 查询文章列表（服务端分页）
 */
router.get('/article/pagination', (req, res, next) => {
    //获取下前端传给后端的分页数据
    let offset = Number(req.query.offset);
    let limit = Number(req.query.limit); //每页固定显示的数据条数（10）
    let sort = req.query.sort || '_id' ; //按哪个字段进行排序
    let order =( req.query.order === 'asc' ? 1 : -1 ); //排序方式  asc代表升序    desc降序

    console.log(sort, order);
    //          0      10      ==>第1页  page
    //          10     10      ==>第2页  
    //          20     10      ==>第3页
    //  offset/limit  +1  = page       
    //查询数据总共有多少条
    Article.count().then(count => {
        responseMesg.data.total = count;
    });
    //skip  limit  跳过前面skip条数据，然后往后取limit条数据
    //sort({ 要排序的字段:+1||-1 })   +1代表升序  -1代表降序
    Article.find().sort({
        [sort]:order
    }).skip(offset).limit(limit).then(articles => {
        // articles.map((item,index)=>{
        //     console.log(item);
        //     item.body=item.body.substring(0,50);
        //     return 
        // });
        responseMesg.success = true;
        responseMesg.data.rows = articles;
        res.json(responseMesg);
    })
});


/**
 * 跳转到文章添加页面
 */
router.get('/article/add', (req, res, next) => {
    res.render('admin/article-add');
});

/**
 * 查询某篇文章，并且跳转到编辑页面
 */
router.get('/article/:id',(req, res, next) => {
    //首先获取到id
    //根据id查询数据
    //把数据传给模板
    //模板渲染数据
    let id = req.params.id;
    Article.findById(id).then(article=>{
        res.render('admin/article-edit',{
            //article:article
            article
        });
    });
    
});

/**
 * 删除文章
 */
router.delete('/article/:id',(req, res, next) => {
    //首先获取到id
    Article.findByIdAndRemove(req.params.id).then(article=>{
        responseMesg.message = '删除成功';
        responseMesg.success = true ;
        res.json(responseMesg);
    });
    
});

/**
 * 修改文章
 */
router.post('/article/update', (req, res, next) => {
    let parms = req.body;
    Article.findByIdAndUpdate(parms.id,{
        title:parms.title,
        body:parms.body
    }).then(article=>{
        if(article){
            responseMesg.success=true;
            responseMesg.message='修改成功';
        }else{
            responseMesg.message='修改失败';
        }
        res.json(responseMesg);
    });
    
});


let i = 0;
/**
 * 保存文章
 */
router.post('/article/save', (req, res, next) => {
    //获取
    let parms = req.body;
    console.log(parms);
    if (!parms.title || !parms.body) {
        responseMesg.message = '标题或者内容不能为空！';
        res.json(responseMesg);
        return;
    }
    new Article({
        title: parms.title,
        body: parms.body
    }).save().then(article => {
        responseMesg.success = true;
        responseMesg.message = '保存成功！';
        res.json(responseMesg);
    });
});




/**
 * 跳转到用户管理
 */
router.get('/user', (req, res, next) => {
    res.render('admin/user', {
        user: req.session.user
    });
});

/**
 * 查询列表（一次性查出所有数据）
 */
router.get('/user/list', (req, res, next) => {
    User.find().then(users => {
        res.json(users);
    });
});

/**
 * 添加用户
 */
router.post('/user/add',(request,response,next)=>{
    //获取
    let parms = request.body;
    parms.level=Number(parms.level);
    console.log(parms);
    new User({
        username:parms.username,
        password:parms.password,//yinyiyy01
        email:parms.email,
        level:parms.level
    }).save().then(user=>{
        console.log(user);
        response.json(user);
    }).catch(error=>{
        console.log('报错了',error);
    })
});


/**
 * 查询用户
 */
router.get('/user/pagination', (req, res, next) => {
    //获取下前端传给后端的分页数据
    let offset = Number(req.query.offset);
    let limit = Number(req.query.limit); //每页固定显示的数据条数（10）
    let sort = req.query.sort || '_id' ; //按哪个字段进行排序
    let order =( req.query.order === 'asc' ? 1 : -1 ); //排序方式  asc代表升序    desc降序

    console.log(sort, order);
    //          0      10      ==>第1页  page
    //          10     10      ==>第2页  
    //          20     10      ==>第3页
    //  offset/limit  +1  = page       
    //查询数据总共有多少条
    User.count().then(count => {
        responseMesg.data.total = count;
    });
    //skip  limit  跳过前面skip条数据，然后往后取limit条数据
    //sort({ 要排序的字段:+1||-1 })   +1代表升序  -1代表降序
    User.find().sort({
        [sort]:order
    }).skip(offset).limit(limit).then(users => {
        // articles.map((item,index)=>{
        //     console.log(item);
        //     item.body=item.body.substring(0,50);
        //     return 
        // });
        responseMesg.success = true;
        responseMesg.data.rows = users;
        res.json(responseMesg);
    })
});

/**
 * 修改用户
 */
router.post('/user/update',(request,response,next)=>{
    let parms = request.body;
    console.log(parms);
    User.findByIdAndUpdate(parms._id,{
        username:parms.username,
        //password:parms.password,
        email:parms.email,
        level:parms.level
    }).then(user=>{
        if(user){
            responseMesg.success=true;
            responseMesg.message='保存成功';
        }else{
            responseMesg.message='保存失败';
        }
        response.json(responseMesg);
    });
});


/**
 * 删除文章
 */
router.delete('/user/:id',(req, res, next) => {
    //首先获取到id
    User.findByIdAndRemove(req.params.id).then(user=>{
        responseMesg.message = '删除成功';
        responseMesg.success = true ;
        res.json(responseMesg);
    });
    
});




/**
 * 退出
 */
router.get('/logout',(req, res, next) => {
    req.session.user=null;
    res.redirect('/login');
});
  

module.exports = router;