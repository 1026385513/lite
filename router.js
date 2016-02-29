var  fs=require('fs');
var  config=require('./config');
var  route=require('./route');
//路由器
function router(req,res){
	var that,defaultFiles,defaultExt,statInfo,files,path;
	var fn,file,efn;
	function executeFunc(funcs,count,sum,req,res){
	  if(count == sum){
	     return ; 
	   }
	   else{
	   		if (typeof funcs[count] =="function")
	   		{
	   			funcs[count](req,res,function(){
			       count++;
			       executeFunc(funcs,count,sum,req,res);
			    });
	   		}
	   		else
	   		{
	   			count++;
			    executeFunc(funcs,count,sum,req,res);
	   		}
	    
	   }  
	}
	//查询注册的路由
	fn=route(req);
	if (fn.length)
	{
		//执行路由
		executeFunc(fn,0,fn.length,req,res);
	}
	else
	{
		//查询资源文件夹里的文件
		defaultFiles=config.get('defaultFiles')||['index.htm','index.html'];
		defaultExt=".html";
		path=process.cwd()+(config.get("resourcePath")||"")+req.pathname;
		fs.exists(path,function(exists){
			if (exists)
			{
				statInfo=fs.lstatSync(path);
				if(statInfo.isDirectory() == true)
				{
					files=fs.readdirSync(path);
					for(var f in files)
					{
						for(var i=0;i<defaultFiles.length;i++)
						{
							if (files[f]==defaultFiles[i])
							{
								req.ext=defaultExt;
								read(path+files[f]);
							}
						}
					}
				}
				else
				{
					read(path);
					return ;
				}
			}
			else
			{
				res.send(404,"page not found!");
				return ;
			}
		});
	}
	//读文件
	function read(file)
	{
		fs.readFile(file,function(err,data){
	      if (!err)
	      {
	       		res.code=200;
	       		res.body=data;
	       		res.send(200,res.body); 
	      }
	      else
	      {
	      	res.send(404,"page not found")
	      }
		});
	}
	
}

module.exports = router;