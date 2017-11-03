function reset(){
    //获取卡片父级
    let $content = $('#content.post-index');
    //获取所有的卡片(集合)
    let $articles = $content.find('article');

    let _margin = 6* 2; //卡片左右的两个margin值\或者是上下的两个margin值

    //获取父级宽度
    let content_width = $content.width();
    //获取卡片原先的宽度(初始化宽度)（包含了margin）
    //let article_width_old = $articles.eq(0).width() + _margin;
    let article_width_old = 249 + _margin;
    console.log("卡片原先的宽度",article_width_old);

    //一行最多能显示多少个卡片
    let max_column = parseInt(content_width/article_width_old);
    console.log('一行最多能显示多少个卡片',max_column);

    //每个卡片的宽度（新的、包括margin）
    let article_width_new = content_width/max_column ;
    //每个卡片内容占多少宽度
    $articles.css('width',content_width/max_column - _margin );


    //获取父级元素的高度（是有卡片撑起来的高度）
    let content_height = $content.height();

    $content.css('height',content_height);//为了防止给卡片加了绝对定位以后，父级高度被改变
    //给卡片绝对定位，以方便挪移
    $articles.css({
        'position':'absolute',
        'left':'0',
        'top':'0'
    });

    let all_height = [] ;//所有卡片的高度都放这集合里

    $articles.each(function(index,item){
        /*
        //console.log(index,item);
        //已知条件 ：  索引index  、每行放多少个卡片max_column
        //公式：  left = article_width_new *列数
        
        //列数    索引   每行数量
        0          0     3        0%3 = 0
        1          1     3        1%3 = 1
        2          2     3        2%3 = 2 
        0          3     3        3%3 = 0
        1          4     3        4%3 = 1
        2          5     3        5%3 = 2
        //列数  =  索引 % max_column
        
        */
        //列数
        let column = index % max_column ;

        let left = article_width_new * column;


        //行数
        /**
        行数    索引   每行数量   
        0          0     3        parseInt(0/3) = 0
        0          1     3        parseInt(1/3) = 0
        0          2     3        parseInt(2/3) = 0 
        1          3     3        parseInt(3/3) = 1
        1          4     3        parseInt(4/3) = 1
        1          5     3        parseInt(5/3) = 1
        行数 =  parseInt(index/max_column) 
        */
        let row = parseInt(index/max_column) ;

        console.log('第'+row+'行第'+column+'列');

        all_height.push($(item).height()+_margin);

        //已知行、列、每行多少个、   求与索引的关系
        //  index  =  row * max_column + column 
        //  0      =  0   *  3         +  0
        //  1      =  0   *  3         +  1
        //  2      =  0   *  3         +  2
        //  3      =  1   *  3         +  0
        //  4      =  1   *  3         +  1
        //  5      =  1   *  3         +  2
        let top = 0;
        while(row>0){
            row -- ;
            top+=all_height[row * max_column + column]
        }

        //$(item).css('left',left);//left位移会触发浏览器的重绘
        $(item).css({
            'transform':'translate('+left+'px,'+top+'px)'
        });

    });


};

reset();
//当浏览器窗口变化的时候 会触发这个事件
window.onresize =function(){
    //重新计算
    reset();
};





