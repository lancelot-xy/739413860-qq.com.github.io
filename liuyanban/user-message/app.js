var express=require("express");
var app=express();
app.use(express.static("./public"));
var router=require("./controller");
app.use("/avatar",express.static("./avatar"));
app.set("view engine","ejs");
var session=require("express-session");
app.use(session({
    secret:'keyboard cat',
    resave:false,
    saveUninitialized:true
}));
app.listen(4000);
app.get("/",router.showIndex);  //主页
app.get("/login",router.login); //跳转登录页
app.get("/word",router.showWord); //留言页
app.get("/findByPage",router.findByPage); //查找显示我的留言
app.get("/findByUsername",router.findByUsername);//
app.get("/findByAllPage",router.findByAllPage);//查找显示全部留言
app.get("/delete",router.delete);   //删除留言
app.get("/insertOne",router.insertOne); //发布留言
app.post("/dologin",router.dologin);    //登录跳转主页
app.post("/doRegist",router.doRegist);  //注册跳转登录
app.get("/regist",router.regist);    //跳转注册页
app.get("/setAvatar",router.showSetavatar);  //设置头像页面
app.post("/doSetAvatar",router.doSetAvatar);//上传头像
app.get("/cut",router.showcut);//剪裁头像页面
app.get("/doCut",router.doCut);//剪切头像图片
app.get("/finduser",router.finduser);//获取所有成员
app.get("/exit",router.exit);//退出登陆