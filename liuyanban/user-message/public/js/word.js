jQuery(function($) {
    $(".pagination li:first").addClass("active");
    var currPage = 1;
    var name = $("h4 span").html();
    getDateByPage(currPage, name);
//定义根据页码追加数据方法
    function getDateByPage(page, name) {
//        console.log(name);
        $.ajax({
            url: "/findByPage",
            data: {"page": page, "name": name},
            success: function (data) {
                //data是当前页面的内容
                //生成页面内容 模板 插件 underscore
                //找到模板节点
                var complied = _.template($("#moban").html());
                $("#neirong").html("");
                for (var i = 0; i < data.length; i++) {
                    var da = data[i];
                    var str = complied({"name": da.name, "text": da.text, "time": da.time, "id": da._id});
                    $("#neirong").append($(str));
                }
            }
        })
    }

    $(".pagination li").on("click", function () {
        //点击获取页码 查找内容
        currPage = parseInt($(this).attr("data-page"));
        getDateByPage(currPage, name);
        $(this).addClass("active").siblings().removeClass("active");
    });

});
