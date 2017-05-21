/**
 * New node file
 */
var fs = require('fs');
var SESSION = require('session-manager');
var sessionManager = SESSION.create({engine: 'file', directory: __dirname + '/.session_data'});
var db = require(process.cwd()+'/lib/db')('sqlite3');
const MODEL ="models";
const CONTROLLER ="controller";
var crypto = require('crypto');
//var md5 = crypto.createHash('md5');
var  defaultUrl = "home";
var routes = function(data){
	 this.config = data;
	 this.db = db;
	 this.models = {};
	 this.crypto =crypto;
};
routes.prototype = {
		action:function(req, res,requrl,params){
			 var auth = {isLog:false, user:"", pass:"",exist:false};
			 var session = sessionManager.start(req, res);
			 var authValue = session.get('auth');
			  if(!authValue){
				  session.set('auth', auth);
			  }
			var path = '';
			if(!requrl || requrl=='/' || requrl=='/index'){
		 		  path = defaultUrl;
		 	  }else{
		 		 path = requrl;
		 	  }
			path = process.cwd()+'/'+CONTROLLER+""+requrl;
			var file = path+'.js';
			if(fs.existsSync(file)){
				req['SESSION'] = session;
				var rt = require(path);
				rt.call(this,req,res,params);
			}else{
				return '503';
			}
		},
		getModel:function(model){
			if(!model)  throw 'model is not';
			var modelPath = model.split('_');
			var join = modelPath.join('/');
		    var path = process.cwd()+'/'+MODEL+"/"+join;
		    var observe = this.hasModelObj(path);
		    if(observe.has ==true){
		    	
		    	return observe.obj
		    }
		    	
		   var params = {};
		    var file = path+'.js';
		    if(fs.existsSync(file)){
				var rt = require(path);
				return rt.call(this,params);
			}else{
				throw 'model file not exist';
			}
		},
		hasModelObj:function(path){
			var obj = this.models[path];
			var has = (obj)?true:false;
			return {'has':has,obj:obj};
		}
} ;
exports = module.exports = init;
function init(data){
  return new routes(data);	 
}