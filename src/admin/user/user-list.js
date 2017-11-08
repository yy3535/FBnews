require('jquery');
require('bootstrap');
require('BOOTSTRAP_CSS');
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
    //url: '/admin/article/list',//客户端分页对应的url
    url: '/admin/user/pagination',//服务端分页的url
    sortOrder: 'desc',
    editable:true,//开启编辑模式
    columns: [
        {field: '_id',title: 'ID',width: 100},//visible:false,//默认隐藏该字段sortable:true,//允许该字段进行排序 
        {field: 'username',title: '用户名'}, 
        {field: 'password',title: '密码'}, 
        {field: 'email',title: '邮箱'}, 
        {field: 'level',title: '等级'}, 
        {
        field: 'oprate',
        title: '操作',
        align: 'center',
        sortable:true,
        formatter: function (value) {
           return `<div class="btn-group" >
                    <button data-action="delete" type="button" class="btn btn-danger">删除</button>
                </div>`;
        },
        events:{
            'click [data-action="delete"]':function(e,value,row ,index){
                let isSrure=window.confirm('您确认要用户 ['+row['username']+'] 吗？');
                if(isSrure){
                    //alert('确定删除');
                    $.ajax({
                        url:'/admin/user/'+row['_id'],
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
    onDblClickRow:function(row, $element,field){
        var index=$element.data('index');
        $('#exampleModal').modal({
            keyboard: false
        });
        $("#id").val(row._id).attr("disabled","disabled");
        $("#username").val(row.username);
        $("#password").val(row.password);
        $("#email").val(row.email);
        $("#level").val(row.level);
        console.log(this);
        //保存
        $('#exampleModal').find("#userSave").on('click',function(){
            row.username=$("#username").val();
            row.password=$("#password").val();
            row.email=$("#email").val();
            row.level=$("#level").val();
            $.ajax({
                url:'/admin/user/update',
                method: 'post',
                data:row,
                success:function(resp){
                    if (resp.success) {
                        $('#exampleModal').modal('hide')
                        $('#table').bootstrapTable('updateRow',{index,row});
                    }
                }
            })
        });
    },
    pagination:true,//是否开启分页
    classes:'table table-hover table-no-bordered',//覆盖默认的表格样式
    showRefresh:true,
    showColumns:true,
    paginationPreText:'上一页',
    paginationNextText:'下一页',
    sidePagination:'server',//启用服务端分页
    responseHandler:function(resp){//加载后端数据成功后会调用的函数
        if(!resp.success){
            return {
                total:0,
                rows:[]
            }
        }
        return resp.data;
    }
});


$("#adduser").on('click',function(e){
    var jsonData={
        
    }

    $.ajax({
        url:'/admin/user/update',
        method: 'post',
        data:row,
        success:function(resp){
            if (resp.success) {
                $('#exampleModal').modal('hide')
                $('#table').bootstrapTable('updateRow',{index,row});
            }
        }
    })
})




