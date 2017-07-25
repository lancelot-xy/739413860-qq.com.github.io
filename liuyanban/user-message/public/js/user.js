jQuery(function($){
    $(".pagination li:first").addClass("active");
    var currPage=1;
    getDateByPage(currPage);
    //定义根据页码追加数据方法
    function getDateByPage(page) {
//        console.log(name);
        $.ajax({
            url: "/findByAllPage",
            data: {"page": page},
            success: function (data) {
                //data是当前页面的内容
                //生成页面内容 模板 插件 underscore
                //找到模板节点
                var compiled = _.template($("#moban").html());
                $("#neirong").html("");
                (function iterator(i) {
                    if (i == data.length) {
                        return;
                    }
                    var name = data[i].name;
                    $.ajax({
                        url: "/findByUsername",
                        data:{"username": name},
                        success: function (data2) {
                            data[i].avatar = data2[0].avatar;
                            var str = compiled(data[i]);
                            $("#neirong").append($(str));
                            iterator(i + 1)
                        }
                    })
                })(0)
            }
        });
    }

    $(".pagination li").on("click",function(){
        //点击获取页码 查找内容
        currPage=parseInt($(this).attr("data-page"));
        getDateByPage(currPage);
        $(this).addClass("active").siblings().removeClass("active");
    });
    $("#login").on("click",function(){
        $.ajax({
            url:"/dologin",
            type:"post",
            data:{
                "username":$("#username").val(),
                "userpwd":$("#userpwd").val()
            },
            success:function(result){
                if(result=="1"){
                    window.location.href="/";
                }else if(result=="-2"){
                    alert("请注册");
                    window.location.href="/regist";
                }else{
                    alert("密码错误")
                }
            }
        })
    });
    $("#finduser").on("click",function(){
        $.ajax({
            url:"/finduser",
            data:{},
            success:function(data){
                var complied = _.template($("#chengyuan").html());
                $("#liebiao").html("");
                for(var i=0;i<data.length;i++){
                    var str = complied(
                        {"username":data[i].username}
                    );
                    $("#liebiao").append($(str));
                }
            }
        });
    })
});