var db=require("../model/db.js");
var express=require("express");
var app=express();
var gm=require("gm");
var fs=require("fs");
var ObjectId=require("mongodb").ObjectId;
var formidable=require("formidable");
var md5=require("../model/md5.js");
var sd=require("silly-datetime");
var session=require("express-session");
app.use(session({
    secret:'keyboard cat',
    resave:false,
    saveUninitialized:true
}));
//主页
exports.showWord=function(req,res){
    if (req.session.login == "1") {
        //如果登陆了
        var name=req.session.username;
        var login = true;
        var avatar=req.session.avatar;
    }else if(req.session.login == "0" ){
        res.send("请登陆后查看");
        return
    }
    db.findNameCount("message",{"name":name},function(count){
        if(count%3==0){
            count=count/3
        }else{
            count=count/3+1
        }
        res.render("word",{
            "count":count,
            "username":name,
            "avatar":avatar,
            "active":"wode",
            "login":login
        });
    })
};
//查找显示我的留言
exports.findByPage=function(req,res){
    var page=parseInt(req.query.page);
    var name=req.query.name;
    db.find("message",{"name":name},{"pageSize":3,"page":page,"sort":{"time":-1}},function(err,result){
        res.send(result);
    });
};

exports.findByAllPage=function(req,res){
    var page=parseInt(req.query.page);
    db.find("message",{},{"pageSize":3,"page":page,"sort":{"time":-1}},function(err,result){
        res.send(result);
    });
};
exports.findByUsername=function(req,res){
    var name=req.query.username;
    db.find("user",{"username":name},function(err,result){
        res.send(result);
    });
};
exports.insertOne=function(req,res){
    var time=sd.format(new Date(),"YYYY-MM-DD HH:mm:ss");
    db.insertOne("message",{"name":req.query.name,"text":req.query.text,"time":time},function(err,result){
        if(err){
            console.log("提交失败");
            return
        }
        res.redirect("/word");
    });
};
exports.delete=function(req,res){
    var id=req.query.id;
    var _id=ObjectId(id);
    db.deleteMany("message",{"_id":_id},function(err,result){
        if(err){
            console.log("删除失败");
        }
        console.log("删除成功");
        res.redirect("/word");
    })
};
exports.showIndex=function(req,res){
    //检索数据库，查找此人的头像
    if (req.session.login == "1") {
        //如果登陆了
       var username = req.session.username;
       var login = true;
       var avatar=req.session.avatar;
    } else {
       //没有登陆
       var username = "";  //制定一个空用户名
       var login = false;
       var avatar=false;
    }
    //已经登陆了，那么就要检索数据库，查登陆这个人的头像
    db.findAllCount("message",function(count){
        if(count%3==0){
           count=count/3
       }else{
            count=count/3+1
        }
       res.render("index",{
            "count":count,
            "username":username,
            "avatar":avatar,
           "active": "shouye",
           "login":login
        });
    });
};
    //db.find("user", {"username": username}, function (err, result) {
    //    if (result.length == 0) {
    //        var avatar = "moren.jpg";
    //    } else {
    //        var avatar = result[0].avatar;
    //    }
    //    res.render("index", {
    //        "login": login,
    //        "username": username,
    //        "active": "shouye",
    //        "avatar": avatar    //登录人的头像
    //    });
    //});

exports.regist=function(req,res){
    res.render("regist",{
        "login":req.session.login=="1"?true:false,
        "username": req.session.login == "1" ? req.session.username : "",
        "active":"regist"
    });
};
exports.doRegist=function(req,res){
    var form=new formidable.IncomingForm();
    form.parse(req,function(err,fields,files) {
        var username = fields.username;
        var pwd = fields.userpwd;
        pwd = md5(pwd);
        db.findNameCount("user", {"username": username}, function (count) {
            if (count != 0) {
                res.send("-1");
                return
            }
            db.insertOne("user", {
                "username": username,
                "pwd": pwd,
                "avatar":"moren.jpg"
            }, function (err, result) {
                if (err) {
                    res.send("-2");
                    return
                }
                req.session.login="1";
                req.session.username=username;
                res.send("1")
            })
        });
    })
};
exports.login=function(req,res){
    res.render("login",{
        "login":req.session.login=="1"?true:false,
        "username": req.session.login == "1" ? req.session.username : "",
        "active":"login"
    });
};
exports.dologin=function(req,res){
    var form=new formidable.IncomingForm();
    form.parse(req,function(err,fields,files){
        var username=fields.username;
        var pwd=fields.userpwd;
        pwd=md5(pwd);
        //检查用户名是否存在
        db.find("user",{"username":username},function(err,result){
            if(result.length==0){
                res.send("-2");
                return
            }
            var oldpwd=result[0].pwd;
            if(pwd==oldpwd){
                req.session.login="1";
                req.session.username=username;
                req.session.avatar=result[0].avatar;
                res.send("1")
            }else{
                res.send("-1");
            }
        });
    })
};
//设置头像页面,必须保证此时是登陆状态
exports.showSetavatar = function(req,res,next){
    if (req.session.login != "1") {
        return;
    }
    res.render("setAvatar.ejs",{
        "login": true,
        "username": req.session.username || "wl",
        "active": "setAvatar"
    });
};
//上传头像请求,必须是登录状态
exports.doSetAvatar=function(req,res,next){
    //必须保证登陆
    if (req.session.login != "1") {
        res.end("非法闯入，这个页面要求登陆！");
        return;
    }
    //接受表单提交的图片
    var form = new formidable.IncomingForm();
    // form.uploadDir = path.normalize(__dirname + "/../avatar");//绝对路径
    form.uploadDir="./avatar";
    form.parse(req, function (err, fields, files) {
        var oldpath = files.avatar.path;
        var newpath = "./avatar/" + req.session.username + ".jpg";
        fs.rename(oldpath, newpath, function (err) {
            if (err) {
                res.send("失败");
                return;
            }
            req.session.avatar = req.session.username + ".jpg";
            //跳转到切的业务
            res.redirect("/cut");
        });
    });
};
exports.showcut=function(req,res,next){
    //必须保证登陆
    if (req.session.login != "1") {
        res.end("非法闯入，这个页面要求登陆！");
        return;
    }
    res.render("cut", {
        avatar: req.session.avatar
    })
};
//执行剪裁头像 ,必须是登录状态
exports.doCut=function(req,res,next){
    if (req.session.login != "1") {
        res.end("非法闯入，这个页面要求登陆！");
        return;
    }
    //这个页面接收几个GET请求参数
    //w、h、x、y
    var filename = req.session.avatar;
    var w = req.query.w;
    var h = req.query.h;
    var x = req.query.l;
    var y = req.query.t;
     //console.log("w",w,h,x,y);
    gm("./avatar/"+filename)
    .crop(w, h, x, y)
    .resize(100,100,"!")
    .write("./avatar/"+filename,function (err) {
        if (err) {
            console.log(err);
            res.send("-1");
            return;
        }
        //更改数据库当前用户的avatar这个值
        db.updateMany("user", {"username": req.session.username}, {
            $set: {"avatar": req.session.avatar}
        }, function (err, results) {
            res.send("1");
        });
    });
};
exports.finduser=function(req,res){
    db.find("user",{},function(err,result){
        res.send(result);
    });
};
exports.exit=function(req,res){
        req.session.login == "0"
    db.findAllCount("message",function(count){
            if(count%3==0){
                count=count/3
            }else{
                count=count/3+1
            }
            res.render("index",{
                "count":count,
                "username":"",
                "avatar":false,
                "active": "shouye",
                "login":false
            });
        });
    };
