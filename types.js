var list={
    "ObjectId":/^[a-zA-Z0-9_]{24}$/,
    "username":/^[a-zA-z][a-zA-Z0-9_]{2,9}$/,
    "password":/^[a-zA-z][a-zA-Z0-9_]{2,9}$/,
    "email":/^[A-Za-zd]+([-_.][A-Za-zd]+)*@([A-Za-zd]+[-.])+[A-Za-zd]{2,5}$/,
    //"title":/^[a-zA-z][a-zA-Z0-9_]{24}$/,
    "string":/.*/,
    "text":/.*/
};
var types=function(type,str){
	var fn;
	
	fn=list[type];
	if (fn)
	{
		return fn.test(str);
	}
	return true;
	
};
types.list=list;
module.exports = types;