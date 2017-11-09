console.log('文章列表');
require('bootstrap-table');
require('bootstrap-table/dist/locale/bootstrap-table-zh-CN');
require('BOOTSTRAP_TABLE_CSS');
//格式化日期  yyyy-MM-dd hh:mm:ss
Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(), //day
        "h+": this.getHours(), //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
        "S": this.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(format))
            format = format.replace(RegExp.$1,
                RegExp.$1.length == 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
    return format;
};

//http://bootstrap-table.wenzhixin.net.cn/zh-cn/documentation/
$('#table').bootstrapTable({
    url: '/admin/article/list',//客户端分页对应的url
    //url: '/admin/article/pagination',//服务端分页的url
    sortOrder: 'desc',
    columns: [{
        field: '_id',
        title: 'ID',
        width: 100,
        //visible:false,//默认隐藏该字段
        sortable:true,//允许该字段进行排序
    }, {
        field: 'title',
        title: '标题'
    }, {
        field: 'time',
        title: '发布时间',
        align: 'center',
        sortable:true,
        formatter: function (value) {
            //value   该字段的值
            if(!value)return '';
            return new Date(value).format('yyyy-MM-dd hh:mm:ss');
        }
    }, {
        field: 'oprate',
        title: '操作',
        align: 'center',
        sortable:true,
        formatter: function (value) {
           return `<div class="btn-group" >
                    <button data-action="edit" type="button" class="btn btn-primary">编辑</button>
                    <button data-action="delete" type="button" class="btn btn-danger">删除</button>
                </div>`;
        },
        events:{
            'click [data-action="edit"]':function(e,value,row ,index){
                //e  ==>事件源对象
                //value  ==>  当前字段
                //row   ==>  这一行的数据
                // index  ==>  当前数据的索引
                console.log(e,value,row ,index);
                location.href='/admin/article/'+row['_id']; //参数url路径化
            },
            'click [data-action="delete"]':function(e,value,row ,index){
                let isSrure=window.confirm('您确认要删除文章 ['+row['title']+'] 吗？');
                if(isSrure){
                    //alert('确定删除');
                    $.ajax({
                        url:'/admin/article/'+row['_id'],
                        method:'delete',
                        success:function(resp){
                            alert(resp.message);
                            if(resp.success){
                                $('#table').bootstrapTable('remove', {
                                    field:'_id',
                                    values:[row['_id']]
                                });
                            }
                        }
                    });
                }
            }
        }
    }],

    pagination:true,//是否开启分页
    classes:'table table-hover table-no-bordered',//覆盖默认的表格样式
    search:true,
    showRefresh:true,
    showColumns:true,
    paginationPreText:'上一页',
    paginationNextText:'下一页'
});