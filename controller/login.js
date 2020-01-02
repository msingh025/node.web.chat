exports = module.exports = login;

function login(req ,res, params){
	 req.accepts('application/json');
	 var that = this;
	 var session =req['SESSION'];
	 var authValue = session.get('auth');
	 var user = req.param('userName');
	 var password = req.param('password');
	 var md5 = that.crypto.createHash('md5')
	 password = md5.update(password).digest('hex');
	 authValue.user = user;
	 auth();
	 //io.sockets.emit('joined',email);
	// res.send(authValue);
	 function auth(){
		 that.db.serialize(function(){
				that.db.all("SELECT user,name,created from chat_user WHERE user='"+user+"' AND password='"+password+"'", function(err, row) {
					try{
						//console.log(row.length);
					 if(err) throw err;
					 if(row.length >0){
						
						 authValue['success']= true;
						 authValue.isLog = true;
						 authValue.exist = false;
						 session.set('auth', authValue);
						 //io.sockets.emit('joined',email);
						 var qry = "UPDATE chat_user set islogin='y' WHERE user='"+user+"'";
						 that.db.run(qry);
						 var register = false;
						 var info = {'register':false, user:user}
						 params['socketsClient'].forEach(function(v,i){
							 if(v.user != user)
							  params.io.to(v.id).emit('joined',info);
						 });
						// console.log('yes');
						 res.json(authValue);
					 }else{
						 throw 'User name or password wrong!'
					 }
					}catch(ex){
						 authValue.isLog = false;
						 authValue['success']= false;
						 authValue['message']=ex;
						 authValue.exist = false;
						 session.set('auth',authValue);
						 res.json(authValue);
					}
				 });
				
			 	
		});
		 
	 }
}