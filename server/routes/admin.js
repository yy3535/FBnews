const express = require('express');
const router = express.Router();
var request = require('request');
var cheerio = require('cheerio');

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
 * 获取爬虫文章
 */
router.post('/article/getCrawlerArticles',(req,res,next)=>{
    // 创建一个空数组，用来装载我们的文章对象
    var articlesData = [];
    var isAdded=false;
    for(var j=0;j<10;j++){
        var rand = Math.random()*10000000000000000;   
        var articleListUrl='http://www.yidianzixun.com/home/q/news_list_for_channel?channel_id=best&cstart='+10*j+'&cend='+10*(j+1)+'&infinite=true&refresh=1&__from__=pc&multi=5&appid=yidian&_='+rand;
        //console.log(articleListUrl);
        request(articleListUrl, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                $ = cheerio.load(body);            
                
                var jsonArticlesData=JSON.parse(body).result;
    
                //console.log("共多少条数据：",jsonArticlesData);
                var articleList=[];
                for(var i=0;i<jsonArticlesData.length;i++){
                    var url=jsonArticlesData[i].url;
                    //console.log(url);
                    request(url,function(error,response,body){
                        console.log("进入文章详情页");
                        if (!error && response.statusCode == 200) {
                            $ = cheerio.load(body);
                            var title=$('.left-wrapper h2').text()==""?"无法获取标题":$('.left-wrapper h2').text();
                            var content=$('.left-wrapper>.content-bd').html()==null?"无法获取内容":$('.left-wrapper .content-bd').html();
                            Article.findOne({'title':title},article=>{
                                if(isAdded&&article){
                                    console.log("重复文章：",article);
                                }else if(title=="无法获取标题"||content=="无法获取内容"){
                                    console.log("文章不可获取");
                                }else{
                                    // 创建文章对象，JS 的对象确实跟 json 的很像呀
                                    var article = new Article({
                                        title : title,
                                        body: content
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
                }
                
            }
        });
    }
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
        password:parms.password,
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