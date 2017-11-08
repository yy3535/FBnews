const express = require('express');
const router = express.Router();

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
 * 添加用户
 */
router.get('/user/add',(request,response,next)=>{
    new User({
        username:request.username,
        password:request.password,//yinyiyy01
        email:request.email,
        level:request.level
    }).save().then(user=>{
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