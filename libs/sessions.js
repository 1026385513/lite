var sessions={};
var list={};
sessions.get=function(sid){
	return list[sid];

}
sessions.set=function(obj,id){
	//
	var rand,sid;

	rand=function(num){
		var s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$";
		var r="";
		  for(var i=0;i<num;i++)
		  {
		    r+=s[Math.floor(Math.random()*(s.length-1))];
		  }
		  return r;
	}
	if(id&&list[id])
	{
		list[id]=obj;
		return id;
	}
	else
	{
		while(sid=rand(32))
		{
			if (!sessions.get(sid))
			{
				break;
			}
		}
		list[sid]=obj;
		return sid;
	}
}
sessions.remove=function(sid){
	if (list[sid])
	{
		delete list[sid];
		return true;
	}
	else
	{
		return false;
	}
}

module.exports = sessions;
