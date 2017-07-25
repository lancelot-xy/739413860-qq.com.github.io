//DAO层的封装，封装了数据库的常用操作
var MongoClient=require("mongodb").MongoClient;
//1.建立连接
var settings=require("../settings");
//var url="mongodb://localhost:27017/web1703";
var url=settings.dburl;
function _connectDB(callback){
    MongoClient.connect(url,function(err,db){
        if(err){
           callback(err,null)
        }
        callback(null,db);

    })
}
//2定义插入函数
exports.insertOne=function(collectionName,json,callback){
    //建立连接
    _connectDB(function(err,db){
        db.collection(collectionName).insertOne(json,function(err,result){
            callback(err,result)
        });
        db.close()
    })
};
//3.修改方法
//update({"name":"aaa"},{$set:{"name":"ddd"}})
exports.updateMany=function(collectionName,json1,json2,callback){
    _connectDB(function(err,db){
        db.collection(collectionName).updateMany(json1,json2,function(err,result){
            callback(err,result);
            db.close()
        })
    })
};
//4.删除方法
//remove({"name":"fff"})
exports.deleteMany=function(collectionName,json,callback){
    _connectDB(function(err,db){
        db.collection(collectionName).deleteMany(json,function(err,result){
                callback(err,result);
                db.close()
        })
    })
};
//5.查询方法
//db.student.find({"age":30})
//假设17条数据，每页显示3条 只查第三页
//db.student.find({"age":30}).skip(6).limit(3).sort({"time":-1}); 跳过6条数据,每页显示3条
exports.find=function(collectionName,json,C,D){
    //先判断用户调用时传入了几个参数
    //如果是3个参数，分别代表了集合名称（集合名称，查询参数，回调函数）
    if(arguments.length==3){
        var callback=C;
        var skipnum=0;
        var limitnum=0;
        var sort={};
    }else if(arguments.length==4){
        //如果是4个参数，分别代表了集合名称（集合名称，查询参数，
        // 分页配置=>每页几条，当前几条  回调函数）
        var callback=D;
        var args=C; //{"pageSize":3,"page":3,"sort":{"age":1}}
        //计算出需要跳过多少条数据
        var skipnum=args.pageSize*(args.page-1)||0;
        //查询几条数据
        var limitnum=args.pageSize||0;
        var sort=args.sort||{};
    }
    _connectDB(function(err,db){
        var all=db.collection(collectionName).find(json).skip(skipnum).limit(limitnum).sort(sort);
        //将all对象转成数组
        var allResults=[];
        all.toArray(function(err,docs){
            if(err){
                callback(err,null);
                db.close();
                return
            }
            allResults=docs;
            callback(null,allResults);
            db.close()
        })
    })
};
//定义查询总记录数
exports.findAllCount=function(collectionName,callback){
    _connectDB(function(err,db){
        db.collection(collectionName).count({}).then(function(count){
            //console.log("count",count);
            callback(count);
            db.close();
        })
    })
};
exports.findNameCount=function(collectionName,json,callback){
    _connectDB(function(err,db){
        db.collection(collectionName).count(json).then(function(count){
            //console.log("count",count);
            callback(count);
            db.close();
        })
    })
};
