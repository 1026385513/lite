var list={};
var role=function(name,obj){
	//查询角色
	if (!obj)
	{
		return list[name];
	}
	else
	{
		
		list[name]=obj;
		
		
	}

}
role.list=list;
module.exports=role;
