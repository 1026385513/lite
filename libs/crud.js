var util=require('util');
var config=require('./config');
var crud={};

crud.get=function(req,res,callback){
		collection=this.db.get(req.collection);
		collection.count(req.query,function(e,d){
			res.count=d;if (req.collection.search('category')>=0) console.log(req.opts)
			collection.find(req.query,req.opts,function(err,docs){
				if (err)
				{
					console.log(err);
					res.code=404;
					res.body="数据链接失败！";
				}
				else{
					res.code=200;
					res.body={data:docs,count:d}
				}
				if (callback) return callback();
			});
		});
	};
crud.post=function(req,res,callback){
		collection=this.db.get(req.collection);
		collection.insert(req.data,function(err,docs){
			if (err)
			{
				console.log(err);
				res.code=404;
				res.body="数据链接失败！";
			}else{
				res.code=200;
				res.body={data:docs,count:1};
			}
			if (callback) return callback(err,docs);
		});			
	};
crud.put=function(req,res,callback){				
		collection=this.db.get(req.collection);
		if (req.params){
			for(var x in req.params){
				req.query[x]=req.params[x];
			}
		}
		collection.update(req.query,{$set:req.data},function(err,docs){
			if (err)
			{
				console.log(err);
				res.code=404;
				res.body="数据链接失败！";
			}else{
				res.code=200;
				res.body={data:req.data,count:docs};
			}
			if (callback) return callback(err,docs);
		});				
	};
crud.delete=function(req,res,callback){
	var app;
	app=this;				
	collection=this.db.get(req.collection);
	//只根据_id删除信息
	try{
		for(var x in req.data._id){
			req.data._id[x]=app.ObjectId(req.data._id[x]);
		}
	}catch(e){
		console.log(e);
		res.send(500,"");
	}
	req.query._id={$in:req.data._id};
	if (req.params){
		for(var x in req.params){
			req.query[x]=req.params[x];
		}
	}
	if (req.group){
		req.query.group={$in:req.group};
	}
	collection.remove(req.query,function(err,docs){
		if (err)
		{
			console.log(err);
			res.code=404;
			res.body="数据链接失败！";
		}else{
			res.code=200;
			res.body={count:docs};
		}
		if (callback) return callback(err,docs);
	});
}

module.exports = crud;
