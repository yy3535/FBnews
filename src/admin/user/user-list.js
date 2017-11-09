// require('bootstrap');
// require('BOOTSTRAP_CSS');
// require('FONTAWESOME');
// require('STYLE_CSS');
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
    url: '/admin/user/list',//客户端分页对应的url
    //url: '/admin/user/pagination',//服务端分页的url
    sortOrder: 'asc',
    columns: [
        {field: '_id',title: 'ID',width: 100,searchable:false},//visible:false,//默认隐藏该字段sortable:true,//允许该字段进行排序 
        {field: 'username',title: '用户名',sortable:true}, 
        {field: 'password',title: '密码',searchable:false}, 
        {field: 'email',title: '邮箱',sortable:true}, 
        {field: 'level',title: '等级',sortable:true,
            formatter: function (value) {
                return value==0?"管理员":"普通用户";
            }
        }, 
        {field: '__v',title: '版本号',visible:false}, 
        {
        field: 'oprate',
        title: '操作',
        align: 'center',
        sortable:true,
        formatter: function (value) {
           return `<div class="btn-group" >
                    <button data-action="edit" type="button" class="btn btn-primary" data-toggle="modal" data-target="#editModal">编辑</button>
                    <button data-action="delete" type="button" class="btn btn-danger">删除</button>
                </div>`;
        },
        events:{
            'click [data-action="edit"]':function(e,value,row ,index){
                $("#editid").val(row._id).attr("disabled","disabled");
                $("#editusername").val(row.username);
                $("#editpassword").val(row.password);
                $("#editemail").val(row.email);
                $("#editlevel").val(row.level);
                //保存
                $('#editModal').find("#editusersave").on('click',function(){
                    row.username=$("#editusername").val();
                    row.password=$("#editpassword").val();
                    row.email=$("#editemail").val();
                    row.level=$("#editlevel").val();
                    $.ajax({
                        url:'/admin/user/update',
                        method: 'post',
                        data:row,
                        success:function(resp){
                            if (resp.success) {
                                $('#editModal').modal('hide');
                                $('#table').bootstrapTable('updateRow',{index,row});
                            }
                        }
                    })
                });
            },
            'click [data-action="delete"]':function(e,value,row ,index){
                let isSrure=window.confirm('您确认要用户 ['+row['username']+'] 吗？');
                if(isSrure){
                    //alert('确定删除');
                    $.ajax({
                        url:'/admin/user/'+row['_id'],
                        method:'delete',
                        success:function(resp){
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
        $('#editModal').modal({
            keyboard: false
        });
        $("#editid").val(row._id).attr("disabled","disabled");
        $("#editusername").val(row.username);
        $("#editpassword").val(row.password);
        $("#editemail").val(row.email);
        $("#editlevel").val(row.level);
        console.log(this);
        //保存
        $('#editModal').find("#editusersave").on('click',function(){
            row.username=$("#editusername").val();
            row.password=$("#editpassword").val();
            row.email=$("#editemail").val();
            row.level=$("#editlevel").val();
            $.ajax({
                url:'/admin/user/update',
                method: 'post',
                data:row,
                success:function(resp){
                    if (resp.success) {
                        $('#editModal').modal('hide')
                        $('#table').bootstrapTable('updateRow',{index,row});
                    }
                }
            })
        });
    },
    pagination:true,//是否开启分页
    classes:'table table-hover table-no-bordered',//覆盖默认的表格样式
    search:true,
    showRefresh:true,
    showColumns:true,
    paginationPreText:'上一页',
    paginationNextText:'下一页'
});


$("#adduser").on('click',function(e){
    $("#insertusername").val("");
    $("#insertpassword").val("");
    $("#insertemail").val("");
    $("#insertlevel").val("0");
    $('#insertModal').modal({
        keyboard: false
    });
    
});
$("#insertusersave").on('click',function(){
    
    var insertRow={
        username:$("#insertusername").val(),
        password:$("#insertpassword").val(),
        email:$("#insertemail").val(),
        level:Number($("#insertlevel").val())
    };
    $.ajax({
        url:'/admin/user/add',
        method: 'post',
        data:insertRow,
        success:function(resp){
            $('#insertModal').modal('hide');

            $('#table').bootstrapTable('refresh');
        }
    })
})


