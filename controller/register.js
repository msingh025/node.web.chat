
exports = module.exports = register;

function register(req ,res, params){
	 var that = this;
	 req.accepts('application/json');
	 var session =req['SESSION'];
	 var authValue = session.get('auth');
	 var user = req.param('rg_userName');
	 var password = req.param('rg_password');
	 var name	 = req.param('rg_name');
	 authValue.isLog = false;
	 authValue.user = user;
	 authValue.exist = false;
	 var md5 = that.crypto.createHash('md5')
	 password = md5.update(password).digest('hex');
	 isexist(user,name, password);
	 //console.log(this);
	// io.sockets.emit('joined',email);
	 
	 function isexist(userName,name, password){
		 that.db.serialize(function(){
				
			 that.db.all("SELECT user from chat_user WHERE user='"+userName+"'", function(err, row) {
					try{
					 if(err) throw err;
					 if(row.length ==0){
						 var f = that.db.prepare("INSERT into chat_user(user,name,password, created, islogin) VALUES (?,?,?,datetime(),'y')").run(userName, name,password ).finalize();
						 var id = that.db.lastInsertRowId;

						 that.db.get("SELECT last_insert_rowid() as last_id FROM chat_user", function(err, row) {
							             if (err) throw err;
							             
							             authValue['success']= true;
										 authValue.isLog = true;
										 authValue.exist = false;
										 session.set('auth', authValue);
										
										 var info = {'register':true, user:userName,'id':row.last_id,name:name};
										 console.log(info);
										 params['socketsClient'].forEach(function(v,i){
											 if(v.user != user)
											  params.io.to(v.id).emit('joined',info);
										 });
										 session.set('auth', authValue);
										 res.send(authValue);
						 });
						 
						
					 }else{
						 authValue['success']= false;
						 authValue.isLog = false;
						 authValue.exist = true;
						 authValue['message']= 'user all ready exist!';
						 session.set('auth', authValue);
						 res.send(authValue);
					 }
					}catch(ex){
						// console.log(ex);
						authValue.isLog = false;
						authValue['success']= false;
						 authValue['message']= ex;
						 session.set('auth', authValue);
						res.send(authValue);
					}
				 });
				
			 	
		});
	}
}