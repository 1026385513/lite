var  mongo=require('mongodb')
    ,monk=require('monk')
    ,db=monk('localhost:27017/cydb');
var sessions=require('./sessions');
var config = require('./config');
var async = require('async');
var app=require('./lite');
var model=require('./model');
var types=require('./types');
var role=require('./role');
var cookie = require('cookie');
var users=require('./hook/users');
    app.db=db;
//加载各个模块
    app.model=model;
    app.role=role;
    app.sessions=sessions;
    app.types=types;
    app.ObjectId=mongo.ObjectId;
//用户模型
app.model("users",{
    "_id":{
      "type":"ObjectId",
      "isnull":true,
      "isonly": true,
      "isstatic":true,
      "delete":true,
      "get":true
    },
    "username": {
       "type": "username",
       "isonly": true,
       "isnull": false,
       "isstatic":true,
       "post":true,
       "get":true
    },
    "password": {
       "type": "password",
       "isnull": false,
       "post":true,
       "put":true
    },
    "email": {
       "type": "email",
       "isnull": false,
       "post":true,
       "get":true,
       "put":true 
    },
    "group":{
        "type":"string",
        "isonly":true,
        "get":true,
        "put":true,
        "isnull":true
    } 
});
//分类模型
app.model("category",{
  "_id":{
      "type":"ObjectId",
      "isnull":true,
      "isonly": true,
      "isstatic":true,
      "delete":true,
      "get":true,
      "post":true
    },
    "name":{
      "type":"string",
      "isonly": true,
      "isstatic":true,
      "delete":true,
      "get":true,
      "post":true,
      "put":true
    },
    "categorys":{
      "type":"array",
      "isnull":true,
      "delete":true,
      "get":true,
      "post":true,
      "put":true
    },
    "sort":{
      "type":"number",
      "isnull":true,
      "delete":true,
      "get":true,
      "post":true,
      "put":true
    }
});
//文章模型
app.model("articles",{
    "_id":{
      "type":"ObjectId",
      "isnull":true,
      "isonly": true,
      "isstatic":true,
      "delete":true,
      "get":true,
      "post":true
    },
    "title": {
       "type": "string",
       "minlen": 1,
       "maxlen": 30,
       "get":true,
       "post":true,
       "put":true 
    },
     "body": {
       "type": "text",
       "get":true,
      "post":true,
      "put":true 
    },
     "click": {
       "type": "int",
       "isnull": true,
       "get":true,
      "post":true,
      "put":true 
    },
     "pubdate": {
       "type": "date",
       "isnull": true,
       "get":true,
      "post":true,
      "put":true 
    },
     "type": {
       "type": "string",
       "get":true,
      "post":true,
      "put":true 
    },
     "keywords": {
       "type": "string",
       "minlen": 0,
       "maxlen": 256,
       "isnull": true,
       "get":true,
      "post":true,
      "put":true 
    },
     "description": {
       "type": "string",
       "minlen": 0,
       "maxlen": 256,
       "isnull": true,
       "get":true,
      "post":true,
      "put":true 
    },
     "pic": {
       "type": "text",
       "isnull": true,
       "get":true,
      "post":true,
      "put":true 
    },
     "tags": {
       "type": "text",
       "isnull": true,
       "get":true,
      "post":true,
      "put":true 
    } 
});

//session模型
app.model('sessions',{
  // "sid":{
  //   "type":"ObjectId",
  //     "isnull":true,
  //     "isonly": true,
  //     "isstatic":true,
  //     "delete":true
  //   },
    "username":{
      "type": "username",
       "isonly": true,
       "isnull": false,
       "isstatic":true,
       "post":true
    },
    "password": {
       "type": "password",
       "isnull": false,
       "post":true
    }
});

app.role('编辑',{
        '/db/users/:uid/password/':{
            "put":[]
        },
        '/db/users/:uid/':{
            "get":[]
        },
        '/db/articles/':{
            "post":[],
            "put":[],
            "get":["编辑"]
        },
        '/db/sessions/':{
          "delete":[]
        }
    
});
app.role('匿名用户',{
        '/db/users/':{
          "post":[],
          "put":["编辑"],
          "get":["编辑"],
          "delete":["编辑"]
        },
        '/db/users/:uid/':{
            "get":[]
        },
        '/db/articles/':{
            
            "get":["编辑"]
        },
        '/db/sessions/':{
          "post":[]
        }
    
});



//权限检查
app.route('/db/.+',function(req,res,next){
    var session,role,scope,sid;
    session=sessions.get(req.cookies.sid);
    if (!session)
    {
        res.send(403,"fobidden!");
        return ;
    }
    role=app.role(session.role)||{};
    if (session.role!="管理员")
    {
      if (role[req.uri]&&role[req.uri][req.method])
      {
          scope=role[req.uri][req.method];
          //角色资源权限
          if (Array.isArray(scope)&&scope.length>0)
          {
              req.group=scope;
          }
          else
          {
              //私有资源权限
              if (req.method!="post")
              {
                if(req.uid&&req.uid!==session.uid)
                {
                    res.send(401,'fobidden!');
                    return ;
                }
              }
          }
          next();
      }   
      else
      {
          res.send(403,'用户权限不足！');
          return ;
      }
    }
    else
    {
      next();
    }
});
//处理查询参数
app.route('/db/.+',function(req,res,next){
  var search,query;
  search=req.search;
  query=null;
  req.opts={};
  if (search)
  {
    //过滤字段
    if (req.search.fields)
    {
      req.opts["fields"]=req.search.fields;
    }
    //排序
    try{
      req.opts["sort"]=JSON.parse(req.search.sort);
    }
    catch(e){
      req.opts["sort"]={"_id":-1};
    }
    //分页
    req.opts["skip"]=req.search.skip||0;
    req.opts['limit']=req.search.limit||config.get('pagesize')||50;
    req.opts['limit']=parseInt(req.opts["limit"])>50?50:req.opts["limit"];
    //查询条件
    try{
      query=JSON.parse(req.search.query);
    }
    catch(e){}
  }
  req.query=query;
  next();
});
//验证查询和输入信息,设置返回字段
app.route('/db/.+',function(req,res,next){
  var model,fields,data,query,q;
  fields={};
  data={};
  query={};
  q=null;
  req.collection=req.paths[1].replace(/\//g,"");
  model=app.model(req.collection); 
  if (!model)
  {
    console.log(req.collection+" model not defined!")
    next();
    return ;
  }
  req.model=model;
  //单个资源查询条件
  if(req.uid)
  {
    req.query=req.query||{};
    if(req.collection=="users")
    {
      req.query._id=req.uid;
    }
    else
    {
      req.query.uid=req.uid;
    }
  }
  //验证输入数据
  if (req.method=="post"&&req.data=="")
  {
      res.send(400,"输入不能为空!")
      return ;
  }
  // if (req.method=="put"&&req.data&&!req.query)
  // {
  //     res.send(400,"查询条件不能为空!")
  //     return ;
  // }
  //

  //验证查询条件
  if (req.query)
  {
    for(var i in req.query)
    {
      if(!model[i]||!model[i]["get"])
      {
        continue;
      }
      query[i]=req.query[i];
    }
  }
  req.query=query;
  //验证输入数据
  if (req.data)
  {
    try{
      req.data=JSON.parse(req.data);
    }
    catch(e){
      res.send(400,"输入数据格式错误！");
      return ;
    }
    for(var m in model)
    {
      //crud权限验证
      if(req.data[m]&&!model[m][req.method])
      {
        res.send(400,"不能 "+req.method+" "+m);
        return ;
      }
      //空字段验证
      if(req.method=="post"&&!req.data[m]&&!model[m].isnull)
      {
         res.send(400,m+" 不能为空!")
          return ;
      }
      if (req.data[m]==""&&!model[m].isnull)
      {
          res.send(400,m+" 不能为空!")
          return ;
      }
      if (req.method!="delete"){
        //数据类型验证
        if (req.data[m]&&!req.app.types(model[m].type,req.data[m]))
        {
          res.send(400,m+" 数据类型错误!");
          return ;
        }
        //唯一的字段
        if (model[m].isonly&&req.data[m])
        {
          q=q?q:{};
          q[m]=req.data[m];
        }
      }
      if (req.data[m])
      {
        data[m]=req.data[m];
      }
    }
    req.data=data;
  }

  //设置返回字段
  for(var m in model)
  {
    if (model[m][req.method])
    {
      fields[m]=1;
    }
  }
  if (!req.opts.fields)
  {
    req.opts.fields=fields;
  }
  else
  {
    for(var f in req.opts.fields)
    {
      if (!fields[f])
      {
        delete req.opts.fields[f];
      }
    }
  }

  
  //唯一性验证
 if (q)
 {
  async.series({
    isonly:function(done){
        app.get({query:q,opts:req.opts,collection:req.collection},res,function(){
          done(null,res.count);
        });
        
    }
    },function(error,result){
      if (!result.isonly)
      {
        next();
        return ;
      }
      else
      {
        res.send(400,"输入数据重复！");
        return ;
      }
  });
 }
 else
 {
  next();
 }
});
//将所有已/back/开始的rul重定向到/back/ (实现angularjs去#)
app.route('/back/.+',function(req,res){
  
  req.pathname="/back/";
  app.router(req,res);
  
});
//
app.route('/db/users/',function(req,res){
   app[req.method](req,res,function(){res.send();});
});
//
app.route('/db/users/:uid/',function(req,res){
   app[req.method](req,res,function(){res.send();});
});
app.route('/db/users/:uid/password/',function(req,res){
   app[req.method](req,res,function(){res.send();});
});
//文章
app.route('/db/articles/',function(req,res){
  if(req.method=="post"){
  req.data.pubdate=(new Date).toLocaleDateString();
  }
  app[req.method](req,res,function(){res.send();});
})
//文章
app.route('/db/articles/:_id/',function(req,res){
  if (!req.method=="post"){
    app[req.method](req,res,function(){res.send();});
  }else{
    res.send(404,'');
  }
  
})
//文章分类
app.route('/db/category/',function(req,res){
  app[req.method](req,res,function(){res.send();});
});
//登陆验证
app.route('/db/sessions/',function(req,res,next){
    
    var request=req;
    var session,q;
    q={};
    q.username=req.data.username;
    q.password=req.data.password;
    if (req.method=="post")
    {
      app.get({query:q,collection:"users"},res,function(){
      var user,sid,session;
      if (res.count)
      {
        user=res.body.data[0];
        session={_id:user._id,username:user.username,role:user.group};
        sid=sessions.set(session,req.cookies.sid);
        res.cookies+=cookie.serialize('sid',sid,{path:'/'});
        res.send(200,session);
        //跳转
      }
      else
      {
        res.send(400,"用户名密码错误！");
      }
     });
    }
    else if (req.method=="delete")
    {
      session=sessions.get(req.cookies.sid);
      if(session)
      {
        sessions.remove(req.cookies.sid);
      }
      else
      {
        res.send(404,"页面不存在！");
      }
    }
    else
    {
      res.send(404,"页面不存在！");
    }
    

});

//数据模型
app.route('/api/model/',function(req,res,next){
  res.send('200',model.list);
});

//基本数据类型
app.route('/api/types/',function(req,res,next){
  res.send('200',types.list);
});


module.exports = app;
