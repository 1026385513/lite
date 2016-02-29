var http = require('http');
var path = require('path');
var url = require('url');
var cookie = require('cookie');
var sessions = require('./sessions');
var config = require('./config');
var log = require('./log')(module);
var router=require('./router');
var route=require('./route');
var crud=require('./crud');

var lite={};

lite.router=router;
lite.route=route;
//加载增删改查命令
lite.get=crud.get;
lite.put=crud.put;
lite.delete=crud.delete;
lite.post=crud.post;
//运行程序
lite.run=function(){
	http.createServer(function (req, res) {
	 	lite.request(req,res);
	 
	}).listen(config.get('port')||3000);
}
//输入
lite.request=function(req,res){
	var ext,cookies,urlparsed,acceptMethod,session,sid;
	//可接受的请求方法
	acceptMethod={
		"get":true,
		"put":true,
		"post":true,
		"delete":true
	};
	req.method=req.method.toLowerCase();
	if(!acceptMethod[req.method])
	{
		res.writeHead(500,"");
		res.write("")
		res.end();
		return ;
	}
	//url处理
	urlparsed=url.parse(req.url,true);
	req.pathname=/\/$/.test(urlparsed.pathname)?urlparsed.pathname:urlparsed.pathname+'/';
	req.paths=req.pathname.match(/(\/[^\/]*)/g)||["/"];
	req.search=urlparsed.query;
	//文件扩展名
	ext=req.url.match(/\.[^?#./]*$/);
	ext=ext?ext[0]:null;
	req.ext=ext;
	//解析cookies
	cookies=req.headers.cookie||"";
	req.cookies=cookie.parse(cookies);
	//路由
	req.data="";
	req.addListener("data",function(data){
		req.data+=data;
		//数据大小未限制
	});
	//session
	res.cookies="";
	session=sessions.get(req.cookies.sid);
    if (!session||!session.role)
    {
        session={role:"匿名用户",uid:""};
        sid=sessions.set(session);
        req.cookies.sid=sid;
        res.cookies+=cookie.serialize('sid',sid,{path:'/'})+";";
    }
	//设置输入输出之间的关联
	req.app=this;
	res.app=this;
	res.req=req;
	res.send=function(code,data)
	{
		if (code) this.code=code;
		if (data) this.body=data;
		this.app.response(this.req,this);
	};
	req.addListener("end",function(){
		lite.router(req,res);
	})
	

}
//输出
lite.response=function(req,res){
	var cookies,headers;
	var ContentTypeList={
		'.js':'text/javascript',
		'.css':'text/css',
		'.jpg':'image/jpeg',
		'.jpeg':'image/jpeg',
		'.gif':'image/gif',
		'.bmp':'image/bmp',
		'.png':'image/png',
		'.htm':'text/html',
		'.html':'text/html'
	};
	//文档类型
	if (req.ext)
	{
		if (!res.ContentType)
		{
			res.ContentType=ContentTypeList[req.ext];
		}
	}
	else
	{
		res.ContentType=undefined;
	}
	if (!res.ContentType)
	{
		res.ContentType="text/plan";
	}
	//文档语言
	if (!res.charset)
	{
		res.charset="utf-8";
	}
	//设置返回头
	res.headers={};
	res.headers["Set-Cookie"]=res.cookies;
	res.headers["Content-Type"]=res.ContentType+";charset="+res.charset;
	if (!res.code)
	{
		res.code=404;
		res.body="page not find";
	}
	if (!res.body)
	{
		res.body=" ";
	}
	//返回头和主体
	res.writeHead(res.code,res.headers);
	if (res.body instanceof Buffer||typeof res.body == "string")
	{
		res.write(res.body);
	}
	else 
	{
		try{
			res.write(JSON.stringify(res.body));
		}catch(e){
			console.log(e);
		}
	}
	res.end();

}
module.exports=lite;



