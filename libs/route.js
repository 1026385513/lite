var list={};
var route=function(req,fn){
	var list,paths,rpaths,m,sum,uri,file,fns,params;
	list=route.list;
	fns=[];
	//查询路由
	if (!fn)
	{
	    paths=req.paths;
	    for(var x in list)
	    {
	    	if ((new RegExp(x)).test(req.pathname)){
	    		fns=fns.concat(list[x]);
	    		uri=x;
	    	}else{
	    		params={};
	    		rpaths=x.match(/(\/[^\/]*)/g)||'';
		        sum=0;
		        if (paths.length!==rpaths.length)
		        {
		            continue;
		        }
		        for(var i=0;i<paths.length;i++)
		        {
		            if (paths[i]==rpaths[i])
		            {
		                sum++;
		                continue;
		            }else{
		            	m=(m=rpaths[i].match(/\/:(.*)/))?m[1]:null;
			            if (m)
			            {
			                params[m]=paths[i].replace("/","");
			                sum++;
			                continue;
			            }
		            }
		        }
		        if (sum==paths.length)
		        {
		        	req.params=params;
		        	fns=fns.concat(list[x]);
		            uri=x;
		        }
	    	}
	    }
	    req.uri=uri;
	    return fns;
	}
	else
	{
		//设置路由
		file=typeof req=="string"?req:(req.uri||"");
		if (list[file])
		{
			
			list[file].push(fn);
		}
		else
		{
			list[file]=[fn];
		}
		
	}

}
route.list=list;
module.exports=route;
