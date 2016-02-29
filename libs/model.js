var list={};
var model=function(name,obj){
	//查询
	if (!obj)
	{
		 //for(var start = +new Date; +new Date - start <= 5000; ) { } 
		return list[name];
	}
	else
	{
		
		list[name]=obj;
		
		
	}

}
model.list=list;
module.exports=model;
