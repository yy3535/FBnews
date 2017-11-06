const webpack = require('webpack');
const path = require('path');
//源码目录
const srcPath = path.resolve(__dirname, 'src');



module.exports = {
    entry: {
        'common/main': [srcPath + '/common/main.js', 'webpack-hot-middleware/client?reload=true'], //4  指定重载策略，修改了前端代码js,css后，浏览器会自动刷新
        'common/admin-lib':['jquery','bootstrap','BOOTSTRAP_CSS','FONTAWESOME','STYLE_CSS'] ,//public/common/admin-lib.js public/common/admin-lib.css
        'common/lib':['jquery','APP_CSS']
    },
    output: {
        path: __dirname + '/public',
        filename: '[name].js',
        publicPath: 'http://localhost:3000/public', //这里的地址要换成代理服务器的地址
    },
    devtool: 'eval-source-map', //2
    resolve:{
        modules:[srcPath,'node_modules'],//指定webpack查找文件目录
        //取别名，在自己的js里面直接使用这个别名
        alias: {
            SRC:srcPath ,
            BOOTSTRAP_CSS:'bootstrap/dist/css/bootstrap.css',
            BOOTSTRAP_TABLE_CSS:'bootstrap-table/dist/bootstrap-table.css',
            FONTAWESOME:'font-awesome/css/font-awesome.min.css',
            APP_CSS: 'SRC/common/app.less',
            STYLE_CSS: 'SRC/common/admin/style.less'
        }
    },
    module: {
        rules: [{
                test: /\.(png|jpg|gif)$/,
                use: 'url-loader'
            },
            {
                test: /(\.css|\.less)$/,
                use: [
                    'style-loader',
                    'css-loader?sourceMap', //2
                    'less-loader' /**处理.less后缀的文件 */
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
                use: [
                    'file-loader'
                ]
            },
            //先暂时性把这个加载器注释掉

            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['es2015'],
                        plugins: ['transform-runtime','syntax-dynamic-import']
                    }
                }
            }



        ]
    },
    plugins: [
        //把jquery的全局变量提取出来的插件(jQuery not undefined)
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        }),
        new webpack.optimize.OccurrenceOrderPlugin(), //根据模块的调用次数，给模块分配id，使得id可预测，降低文件大小 
        new webpack.HotModuleReplacementPlugin(), // 1.启用 HMR，模块热替换
        new webpack.NoEmitOnErrorsPlugin() //报错但不退出webpack的进程
    ]


};